import payos from '../config/payos.js';
import { CLIENT_URL } from '../config/env.js';
import { sendMailSafe } from '../config/nodemailer.js';
import bookingModel, { BOOKING_STATUS, PAY_STATUS } from '../models/bookingModel.js';
import { HOLD_MINUTES, depositOf, findBooking, isClosed, lockSlots } from '../services/booking.js';
import { bookingMail } from '../services/generateEmail.js';
import { notifyBooking } from './bookingController.js';
import { asyncHandler, fail } from '../utils/http.js';
import dayjs from '../utils/time.js';

const PAYOS_TEST_ORDER = 123;

// 13 chữ số: 10 số cuối timestamp + 3 số ngẫu nhiên → gần như không trùng
const newOrderCode = () =>
    Number(
        `${String(Date.now()).slice(-10)}${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, '0')}`,
    );

// Số tiền do server quyết định: cọc 50% (lần đầu) hoặc toàn bộ phần còn lại
const amountFor = (booking, type) =>
    type === 'deposit' && booking.isPay === PAY_STATUS.NONE ? depositOf(booking.total_money) : booking.payment_amount;

export const createOrder = asyncHandler(async (req, res) => {
    const { id_booking, type = 'full' } = req.body;
    const booking = await bookingModel.findOne({ id_booking });
    if (!booking) fail(404, 'Không tìm thấy đơn đặt phòng');
    if (isClosed(booking.status) || booking.payment_amount <= 0) fail(400, 'Đơn này không cần thanh toán');

    // Đơn chờ thanh toán chỉ được trả trong thời gian giữ chỗ
    const expiresAt =
        booking.status === BOOKING_STATUS.PENDING
            ? dayjs(booking.createdAt).add(HOLD_MINUTES, 'minute')
            : dayjs().add(HOLD_MINUTES, 'minute');
    if (expiresAt.isBefore(dayjs().add(1, 'minute'))) fail(400, 'Đơn đã hết thời gian giữ chỗ');

    booking.orderCode = newOrderCode();
    await booking.save();

    const returnUrl = `${CLIENT_URL}/bookRoom/${booking.id_booking}`;
    const link = await payos.createPaymentLink({
        orderCode: booking.orderCode,
        amount: amountFor(booking, type),
        description: `BOX ${booking.id_booking}`, // PayOS giới hạn 25 ký tự
        returnUrl,
        cancelUrl: returnUrl,
        expiredAt: expiresAt.unix(),
    });
    res.json({ success: true, checkoutUrl: link.checkoutUrl });
});

// Webhook PayOS luôn trả 200 khi đã xác thực, tránh PayOS gửi lại
export const handleWebhook = asyncHandler(async (req, res) => {
    let data;
    try {
        data = payos.verifyPaymentWebhookData(req.body);
    } catch {
        return res.status(400).json({ success: false, message: 'Webhook không hợp lệ' });
    }

    const { orderCode, amount } = data;
    if (orderCode === PAYOS_TEST_ORDER) return res.json({ success: true });

    const booking = await findBooking({ orderCode });
    // Bỏ qua đơn không tồn tại hoặc webhook lặp lại
    if (!booking || booking.payments.some((p) => p.orderCode === orderCode)) return res.json({ success: true });

    booking.payments.push({ orderCode, amount, paidAt: new Date() });
    booking.payment_amount = Math.max(0, booking.payment_amount - amount);
    booking.isPay = booking.payment_amount === 0 ? PAY_STATUS.FULL : PAY_STATUS.HALF;

    if (booking.status === BOOKING_STATUS.PENDING) booking.status = BOOKING_STATUS.SUCCESS;
    else if (isClosed(booking.status)) {
        // Tiền về sau khi đơn hết hạn: giữ lại chỗ nếu còn trống, ngược lại đánh dấu cần hoàn tiền
        try {
            await lockSlots(booking);
            booking.status = BOOKING_STATUS.SUCCESS;
        } catch {
            booking.refundRequired = true;
        }
    }
    await booking.save();

    notifyBooking(req, booking);
    sendMailSafe(
        bookingMail({
            title: 'Thanh toán thành công',
            message: booking.refundRequired
                ? 'Chúng tôi đã nhận thanh toán nhưng khung giờ không còn trống. PNM - BOX sẽ liên hệ hoàn tiền cho bạn.'
                : `Chúng tôi đã nhận ${amount.toLocaleString('vi-VN')}đ. Thông tin đơn của bạn:`,
            booking,
        }),
    );
    res.json({ success: true });
});
