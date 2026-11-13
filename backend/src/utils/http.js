// Lỗi có HTTP status, được errorHandler chuyển thành response
export class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

export const fail = (status, message) => {
    throw new HttpError(status, message);
};

// Bọc controller async để lỗi đi thẳng vào errorHandler
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const ok = (res, data, message, status = 200) => res.status(status).json({ success: true, message, data });
