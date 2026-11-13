// Đồng bộ với backend/src/models/bookingModel.js
export const BOOKING_STATUS = {
    SUCCESS: "THÀNH CÔNG",
    DONE: "HOÀN THÀNH",
    CANCELLED: "ĐÃ HỦY",
    FAILED: "THẤT BẠI",
    PENDING: "CHỜ THANH TOÁN",
};

export const PAY_STATUS = {
    NONE: "CHƯA THANH TOÁN",
    HALF: "ĐÃ THANH TOÁN 50%",
    FULL: "ĐÃ THANH TOÁN",
};

export const isClosed = (b) =>
    [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.FAILED].includes(b?.status);

export const canPay = (b) => !!b && !isClosed(b) && b.payment_amount > 0;

// Khách chỉ tự hủy được đơn chưa thanh toán (server kiểm tra thêm giờ bắt đầu)
export const canCustomerCancel = (b) =>
    [BOOKING_STATUS.SUCCESS, BOOKING_STATUS.PENDING].includes(b?.status) &&
    b?.isPay === PAY_STATUS.NONE;
