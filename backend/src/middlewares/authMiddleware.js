import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import accountModel from '../models/accountModel.js';
import { HttpError } from '../utils/http.js';

const readToken = (req) => req.cookies?.token || req.headers.authorization?.replace(/^Bearer /, '');

// Gắn req.user = { id, email, role } nếu token hợp lệ và tài khoản còn hoạt động
const resolveUser = async (req) => {
    const token = readToken(req);
    if (!token) return null;
    try {
        const { id } = jwt.verify(token, env.JWT_SECRET);
        const account = await accountModel.findById(id, 'email role isLock').lean();
        if (!account || account.isLock) return null;
        return { id: String(account._id), email: account.email, role: account.role };
    } catch {
        return null;
    }
};

export const optionalAuth = async (req, res, next) => {
    req.user = await resolveUser(req);
    next();
};

export const requireAuth = async (req, res, next) => {
    req.user = await resolveUser(req);
    next(req.user ? undefined : new HttpError(401, 'Vui lòng đăng nhập lại'));
};

export const requireRole =
    (...roles) =>
    (req, res, next) =>
        requireAuth(req, res, (err) =>
            next(
                err || (roles.includes(req.user.role) ? undefined : new HttpError(403, 'Bạn không có quyền truy cập')),
            ),
        );

export const requireAdmin = requireRole('admin');

export const isAdmin = (user) => user?.role === 'admin';
