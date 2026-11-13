import { env } from '../config/env.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    let status = err.status || 500;
    let message = err.message;

    if (err.code === 11000) [status, message] = [409, 'Dữ liệu đã tồn tại'];
    else if (err.name === 'ValidationError' || err.name === 'CastError')
        [status, message] = [400, 'Dữ liệu không hợp lệ'];
    else if (err.name === 'MulterError') status = 400;

    if (status >= 500) {
        console.error(err);
        if (env.IS_PROD) message = 'Lỗi server, vui lòng thử lại sau';
    }
    res.status(status).json({ success: false, message });
};
