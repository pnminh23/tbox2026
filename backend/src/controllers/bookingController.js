import mongoose from 'mongoose';
import bookingModel, { ACTIVE_STATUSES, BOOKING_STATUS, PAY_STATUS } from '../models/bookingModel.js';
import accountModel from '../models/accountModel.js';
import comboModel from '../models/comboModel.js';
import roomModel from '../models/roomModel.js';
import timeSlotModel from '../models/timeSlotModel.js';
import { sendMailSafe } from '../config/nodemailer.js';
import { bookingMail } from '../services/generateEmail.js';
import {
    PAYMENT_THRESHOLD,
    assertSlotsFree,
    depositOf,
    findBooking,
    isClosed,
    isOwner,
    lockSlots,
    nextBookingId,
    populateBooking,
    releaseBooking,
    takePromotion,
    toBookingView,
} from '../services/booking.js';
import { isAdmin } from '../middlewares/authMiddleware.js';
import { buildAvailability } from '../services/availability.js';
import { asyncHandler, fail, ok } from '../utils/http.js';
import { formatString } from '../utils/format.js';
import { dayRange, now, slotTime, vnDay } from '../utils/time.js';

const SAME_DAY_GRACE_MINUTES = 10; // cho phép đặt khung giờ vừa bắt đầu tối đa 10 phút

// Khung giờ hợp lệ, liên tiếp và chưa qua
const loadSlots = async (ids, date) => {
    if (!Array.isArray(ids) || !ids.length) fail(400, 'Chưa chọn khung giờ');
    const slots = await timeSlotModel.find({ _id: { $in: ids } }).sort({ start_time: 1 });
    if (slots.length !== new Set(ids.map(String)).size) fail(400, 'Khung giờ không hợp lệ');

    slots.slice(1).forEach((slot, i) => {
        if (slots[i].end_time !== slot.start_time) fail(400, 'Các khung giờ phải liên tiếp nhau');
    });
    if (slotTime(date, slots[0].start_time).isBefore(now().subtract(SAME_DAY_GRACE_MINUTES, 'minute'))) {
        fail(400, 'Khung giờ đã qua');
    }
    return slots;
};

// Giá: combo theo loại phòng hoặc đơn giá/phút × số phút; trừ % khuyến mãi
const calcTotal = async ({ room, comboId, minutes, discountPercent }) => {
    let base = room.type.base_price_per_minute * minutes;
    if (comboId) {
        const combo = await comboModel.findById(comboId);
        if (!combo) fail(404, 'Combo không tồn tại');
        const price = combo.types.find((t) => String(t.typeRoom) === String(room.type._id))?.price;
        if (price == null) fail(400, 'Combo không áp dụng cho loại phòng này');
        if (combo.duration !== minutes)
            fail(400, `Combo yêu cầu ${combo.duration} phút, bạn đang chọn ${minutes} phút`);
        base = price;
    }
    return Math.round(base * (1 - discountPercent / 100));
};

// Thông tin khách: ưu tiên tài khoản đang đăng nhập
const resolveCustomer = async (user, body) => {
    const account = user && (await accountModel.findById(user.id, 'name email phone'));
    const customer = {
        name_client: formatString(account?.name || body.name_client),
        email: (account?.email || body.email || '').trim(),
        phone: formatString(account?.phone || body.phone),
    };
    if (!customer.name_client || !customer.email || !customer.phone)
        fail(400, 'Vui lòng nhập đầy đủ họ tên, email, số điện thoại');
    return customer;
};

const pickManualStatus = ({ status, isPay }) => ({
    status: ACTIVE_STATUSES.includes(status) ? status : undefined,
    isPay: Object.values(PAY_STATUS).includes(isPay) ? isPay : undefined,
});

export const notifyBooking = (req, booking, event = 'editBooking') => req.io?.emit(event, booking);

export const createBooking = asyncHandler(async (req, res) => {
    const { room: roomId, date, time_slots, film, combo, promotion } = req.body;
    if (!roomId || !date) fail(400, 'Thiếu phòng hoặc ngày đặt');

    const customer = await resolveCustomer(req.user, req.body);
    const room = await roomModel.findById(roomId).populate('type');
    if (!room || room.status !== 'Active') fail(404, 'Phòng không tồn tại hoặc đang tạm ngưng');
    if (!room.type) fail(400, 'Phòng chưa được gán loại phòng');

    const day = vnDay(date);
    if (day.isBefore(now().startOf('day'))) fail(400, 'Không thể đặt ngày đã qua');
    const slots = await loadSlots(time_slots, day);
    const minutes = slots.reduce((sum, s) => sum + s.slot_duration, 0);

    const draft = {
        _id: new mongoose.Types.ObjectId(),
        room: room._id,
        date: day.toDate(),
        time_slots: slots.map((s) => s._id),
    };
    await assertSlotsFree(draft);
    await lockSlots(draft);

    let promo;
    try {
        promo = await takePromotion(promotion);
        const total = await calcTotal({
            room,
            comboId: combo || null,
            minutes,
            discountPercent: promo?.discountPercent || 0,
        });
        const needPay = total > PAYMENT_THRESHOLD;

        // Admin được ghi nhận trạng thái thực tế (khách tại quầy)
        const manual = isAdmin(req.user) ? pickManualStatus(req.body) : {};

        await bookingModel.create({
            ...draft,
            ...customer,
            id_booking: await nextBookingId(day),
            film: film || null,
            combo: combo || null,
            promotion: promo?.name || null,
            status: manual.status || (needPay ? BOOKING_STATUS.PENDING : BOOKING_STATUS.SUCCESS),
            isPay: manual.isPay || PAY_STATUS.NONE,
            total_money: total,
            payment_amount: manual.isPay === PAY_STATUS.FULL ? 0 : total,
        });
    } catch (err) {
        await releaseBooking({ _id: draft._id, promotion: promo?.name });
        throw err;
    }

    const booking = await findBooking({ _id: draft._id });
    notifyBooking(req, booking, 'newBooking');

    if (booking.status === BOOKING_STATUS.PENDING) {
        const deposit = depositOf(booking.total_money);
        return res.json({
            success: true,
            paymentRequired: true,
            message: `Đơn của bạn là ${booking.total_money.toLocaleString('vi-VN')}đ, cần thanh toán tối thiểu ${deposit.toLocaleString('vi-VN')}đ để giữ chỗ`,
            money: deposit,
            data: booking,
        });
    }

    sendMailSafe(
        bookingMail({
            title: 'Cảm ơn bạn đã đặt phòng',
            message: 'Bạn đã đặt phòng thành công. Thông tin chi tiết:',
            booking,
        }),
    );
    ok(res, booking, 'Đặt phòng thành công! Email xác nhận đã được gửi đến bạn');
});

// Khung giờ đã có người giữ của 1 phòng trong ngày (công khai, chỉ trả id)
export const getBookedTimeSlotsByRoom = asyncHandler(async (req, res) => {
    const { room, date } = req.params;
    const bookings = await bookingModel.find(
        { room, date: dayRange(date), status: { $in: ACTIVE_STATUSES } },
        'time_slots',
    );
    ok(res, { room, bookedTimeSlots: bookings.flatMap((b) => b.time_slots) });
});

// Phòng trống của cả cơ sở trong ngày (một lần gọi cho lưới đặt phòng)
export const getAvailability = asyncHandler(async (req, res) => {
    const { branch, date } = req.query;
    if (!branch || !date) fail(400, 'Thiếu cơ sở hoặc ngày');

    const rooms = await roomModel.find({ branch }).populate('type').lean();
    const bookings = await bookingModel
        .find(
            { room: { $in: rooms.map((r) => r._id) }, date: dayRange(date), status: { $in: ACTIVE_STATUSES } },
            'room time_slots',
        )
        .lean();
    ok(res, { date: vnDay(date).format('YYYY-MM-DD'), rooms: buildAvailability(rooms, bookings) });
});

const sendBooking = async (res, filter, user) => {
    const booking = await findBooking(filter);
    if (!booking) fail(404, 'Không tìm thấy đơn đặt phòng');
    ok(res, toBookingView(booking, user));
};

export const getBookedByOrderCode = asyncHandler((req, res) =>
    sendBooking(res, { orderCode: req.params.orderCode }, req.user),
);
export const getBookedById = asyncHandler((req, res) =>
    sendBooking(res, { id_booking: req.params.id_booking }, req.user),
);

/* ---------- Đơn của người đang đăng nhập ---------- */

const myBookings = (user, filter = {}, sort = { date: -1 }) =>
    populateBooking(bookingModel.find({ email: user.email, ...filter }).sort(sort));

export const getBookedByEmail = asyncHandler(async (req, res) => ok(res, await myBookings(req.user)));

export const getBookedByEmailCurrent = asyncHandler(async (req, res) =>
    ok(res, await myBookings(req.user, { date: dayRange(now()) }, { createdAt: -1 })),
);

export const getBookedByEmailAndMonth = asyncHandler(async (req, res) => {
    const month = vnDay(`${req.params.year}-${String(req.params.month).padStart(2, '0')}-01`);
    if (!month.isValid()) fail(400, 'Tháng không hợp lệ');
    const range = { $gte: month.toDate(), $lte: month.endOf('month').toDate() };
    ok(res, await myBookings(req.user, { date: range }));
});

export const getBookingStatsByEmail = asyncHandler(async (req, res) => {
    const email = req.user.email;
    const [totalBooking, totalBookingsToday, completedBookingsToday, cancelledBookingsToday] = await Promise.all([
        bookingModel.countDocuments({ email }),
        bookingModel.countDocuments({ email, date: dayRange(now()) }),
        bookingModel.countDocuments({ email, status: BOOKING_STATUS.DONE }),
        bookingModel.countDocuments({ email, status: BOOKING_STATUS.CANCELLED }),
    ]);
    ok(res, { totalBooking, totalBookingsToday, completedBookingsToday, cancelledBookingsToday });
});

/* ---------- Admin ---------- */

export const getCurrentActiveRoomsWithBookingId = asyncHandler(async (req, res) => {
    const current = now().format('HH:mm');
    const bookings = await bookingModel
        .find({ date: dayRange(now()), status: { $in: [BOOKING_STATUS.SUCCESS, BOOKING_STATUS.DONE] } })
        .populate('time_slots');

    const active = bookings
        .filter((b) => b.time_slots.some((s) => current >= s.start_time && current < s.end_time))
        .map((b) => ({ roomId: b.room, bookingId: b.id_booking }));
    ok(res, active);
});

export const getAllBookings = asyncHandler(async (req, res) =>
    ok(res, await populateBooking(bookingModel.find().sort({ createdAt: -1 }))),
);

export const getBookingsByDate = asyncHandler(async (req, res) => {
    if (!req.query.date) fail(400, 'Vui lòng cung cấp ngày');
    ok(res, await populateBooking(bookingModel.find({ date: dayRange(req.query.date) }).sort({ createdAt: -1 })));
});

export const getBookingsByMonth = asyncHandler(async (req, res) => {
    const month = vnDay(`${req.query.month}-01`);
    if (!req.query.month || !month.isValid()) fail(400, 'Vui lòng cung cấp tháng (YYYY-MM)');
    const range = { $gte: month.toDate(), $lte: month.endOf('month').toDate() };
    ok(res, await populateBooking(bookingModel.find({ date: range }).sort({ createdAt: -1 })));
});

/* ---------- Cập nhật trạng thái ---------- */

// Khách chỉ được tự hủy đơn chưa thanh toán và chưa tới giờ
const assertCustomerCancel = (booking, status) => {
    if (status !== BOOKING_STATUS.CANCELLED) fail(403, 'Bạn chỉ có thể hủy đơn');
    if (![BOOKING_STATUS.SUCCESS, BOOKING_STATUS.PENDING].includes(booking.status)) fail(400, 'Đơn này không thể hủy');
    if (booking.isPay !== PAY_STATUS.NONE)
        fail(400, 'Đơn đã thanh toán, vui lòng liên hệ PNM - BOX để được hỗ trợ hủy');
    if (slotTime(booking.date, booking.time_slots[0].start_time).isBefore(now()))
        fail(400, 'Đã quá giờ, không thể hủy');
};

export const editBooking = asyncHandler(async (req, res) => {
    const booking = await findBooking({ _id: req.params._id });
    if (!booking) fail(404, 'Không tìm thấy đơn đặt phòng');

    const status = formatString(req.body.status).toUpperCase() || undefined;
    const isPay = formatString(req.body.isPay).toUpperCase() || undefined;
    if (status && !Object.values(BOOKING_STATUS).includes(status)) fail(400, 'Trạng thái không hợp lệ');
    if (isPay && !Object.values(PAY_STATUS).includes(isPay)) fail(400, 'Trạng thái thanh toán không hợp lệ');

    if (!isAdmin(req.user)) {
        if (!isOwner(booking, req.user)) fail(403, 'Bạn không có quyền sửa đơn này');
        if (isPay) fail(403, 'Bạn không thể đổi trạng thái thanh toán');
        assertCustomerCancel(booking, status);
    }

    // Đóng đơn → trả chỗ; mở lại đơn đã đóng → giữ chỗ lại
    if (status && isClosed(status) !== isClosed(booking.status)) {
        if (isClosed(status)) await releaseBooking(booking);
        else {
            await assertSlotsFree(booking);
            await lockSlots(booking);
        }
    }

    if (status) booking.status = status;
    if (isPay) {
        booking.isPay = isPay;
        if (isPay === PAY_STATUS.FULL) booking.payment_amount = 0;
    }
    await booking.save();

    notifyBooking(req, booking);
    ok(res, booking, 'Cập nhật đơn đặt phòng thành công');
});
