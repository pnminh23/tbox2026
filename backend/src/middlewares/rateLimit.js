import rateLimit from 'express-rate-limit';

const limiter = (windowMinutes, limit) =>
    rateLimit({
        windowMs: windowMinutes * 60 * 1000,
        limit,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { success: false, message: 'Bạn thao tác quá nhanh, vui lòng thử lại sau ít phút' },
    });

// Đăng nhập / đăng ký / OTP: chống dò mật khẩu và brute-force OTP
export const authLimiter = limiter(15, 20);
export const otpLimiter = limiter(15, 10);
