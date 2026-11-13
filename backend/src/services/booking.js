import bookingModel, { ACTIVE_STATUSES, BOOKING_STATUS } from '../models/bookingModel.js';
import slotLockModel from '../models/slotLockModel.js';
import promotionModel from '../models/promotionModel.js';
import { nextSeq } from '../models/counterModel.js';
import { isAdmin } from '../middlewares/authMiddleware.js';
import { HttpError } from '../utils/http.js';
import { maskEmail, maskPhone } from '../utils/format.js';
import { dayKey, dayRange, vnDay } from '../utils/time.js';

export const PAYMENT_THRESHOLD = 150000; // đơn lớn hơn mức này phải thanh toán trước
export const HOLD_MINUTES = 15; // thời gian giữ chỗ cho đơn chờ thanh toán

export const depositOf = (total) => Math.ceil(total / 2);

// Mã đơn YYMMDD + 3 số thứ tự (vd 261114001), bộ đếm nguyên tử nên không trùng
export const nextBookingId = async (date) => {
    const prefix = vnDay(date).format('YYMMDD');
    const seq = await nextSeq(`booking-${prefix}`);
    if (seq > 999) throw new HttpError(400, 'Đã vượt quá số lượt đặt tối đa trong ngày');
    return Number(`${prefix}${String(seq).padStart(3, '0')}`);
};

export const populateBooking = (query) =>
    query
        .populate({ path: 'room', populate: [{ path: 'type' }, { path: 'branch' }] })
        .populate('time_slots')
        .populate('film')
        .populate('combo');

export const findBooking = (filter) => populateBooking(bookingModel.findOne(filter));

const idOf = (v) => v?._id || v;

// Chuẩn hóa booking (có thể đã populate) về dạng id
const slotRef = (b) => ({ _id: b._id, room: idOf(b.room), date: b.date, time_slots: b.time_slots.map(idOf) });

// Kiểm tra trùng với đơn cũ (tạo trước khi có slotLock)
export const assertSlotsFree = async (booking) => {
    const { _id, room, date, time_slots } = slotRef(booking);
    const conflict = await bookingModel.exists({
        _id: { $ne: _id },
        room,
        time_slots: { $in: time_slots },
        status: { $in: ACTIVE_STATUSES },
        date: dayRange(date),
    });
    if (conflict) throw new HttpError(409, 'Khung giờ này đã có người đặt');
};

// Khóa (phòng, ngày, khung giờ); trùng → 409 và hoàn tác phần đã khóa
export const lockSlots = async (booking) => {
    const { _id, room, date, time_slots } = slotRef(booking);
    const day = dayKey(date);
    const docs = time_slots.map((slot) => ({ room, day, slot, booking: _id }));
    try {
        await slotLockModel.insertMany(docs, { ordered: true });
    } catch (err) {
        await slotLockModel.deleteMany({ booking: _id });
        if (err.code === 11000) throw new HttpError(409, 'Khung giờ này đã có người đặt');
        throw err;
    }
};

export const releaseSlots = (bookingId) => slotLockModel.deleteMany({ booking: bookingId });

// Trả chỗ + trả lượt mã giảm giá khi đơn bị hủy/hết hạn
export const releaseBooking = async (booking) => {
    await releaseSlots(booking._id);
    if (booking.promotion) await promotionModel.updateOne({ name: booking.promotion }, { $inc: { quantity: 1 } });
};

// Lấy 1 lượt mã giảm giá (nguyên tử, không âm)
export const takePromotion = async (name) => {
    if (!name) return null;
    const promo = await promotionModel.findOneAndUpdate(
        { name: name.trim().toUpperCase(), quantity: { $gt: 0 } },
        { $inc: { quantity: -1 } },
        { new: true },
    );
    if (!promo) throw new HttpError(400, 'Mã giảm giá không hợp lệ hoặc đã hết lượt');
    return promo;
};

export const isOwner = (booking, user) => !!user && booking.email === user.email;

// Ẩn thông tin liên hệ với người không phải chủ đơn/admin (link chi tiết đơn là công khai)
export const toBookingView = (booking, user) => {
    const data = booking.toObject ? booking.toObject() : booking;
    if (isAdmin(user) || isOwner(booking, user)) return data;
    return { ...data, email: maskEmail(data.email), phone: maskPhone(data.phone) };
};

export const isClosed = (status) => [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.FAILED].includes(status);
