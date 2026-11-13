import mongoose from 'mongoose';

export const BOOKING_STATUS = {
    SUCCESS: 'THÀNH CÔNG',
    DONE: 'HOÀN THÀNH',
    CANCELLED: 'ĐÃ HỦY',
    FAILED: 'THẤT BẠI',
    PENDING: 'CHỜ THANH TOÁN',
};

export const PAY_STATUS = {
    NONE: 'CHƯA THANH TOÁN',
    HALF: 'ĐÃ THANH TOÁN 50%',
    FULL: 'ĐÃ THANH TOÁN',
};

// Trạng thái còn giữ chỗ
export const ACTIVE_STATUSES = [BOOKING_STATUS.SUCCESS, BOOKING_STATUS.DONE, BOOKING_STATUS.PENDING];

const bookingSchema = new mongoose.Schema(
    {
        id_booking: { type: Number, required: true, unique: true },
        orderCode: { type: Number, default: 0, index: true },
        name_client: { type: String, required: true },
        email: { type: String, required: true, trim: true, index: true },
        phone: { type: String, required: true },
        film: { type: mongoose.Schema.Types.ObjectId, ref: 'films' },
        combo: { type: mongoose.Schema.Types.ObjectId, ref: 'combo' },
        room: { type: mongoose.Schema.Types.ObjectId, ref: 'rooms', required: true },
        date: { type: Date, required: true },
        time_slots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'timeSlots', required: true }],
        promotion: { type: String },
        status: { type: String, enum: Object.values(BOOKING_STATUS), default: BOOKING_STATUS.SUCCESS },
        isPay: { type: String, enum: Object.values(PAY_STATUS), default: PAY_STATUS.NONE },
        total_money: { type: Number, required: true },
        payment_amount: { type: Number, required: true }, // số tiền còn phải trả
        payments: [{ orderCode: Number, amount: Number, paidAt: Date }],
        refundRequired: { type: Boolean, default: false }, // tiền về sau khi đơn đã hủy/hết hạn
        isReviewed: { type: Boolean, default: false },
    },
    { timestamps: true },
);

bookingSchema.index({ room: 1, date: 1 });
bookingSchema.index({ status: 1, createdAt: 1 });

const bookingModel = mongoose.models.booking || mongoose.model('booking', bookingSchema);

export default bookingModel;
