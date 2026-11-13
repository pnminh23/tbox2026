import bcrypt from 'bcryptjs';
import accountModel from '../models/accountModel.js';
import { destroyImage } from '../config/cloudinary.js';
import { validateProfile } from '../validations/accountValidation.js';
import { asyncHandler, fail, ok } from '../utils/http.js';
import { formatString } from '../utils/format.js';

const ROLES = ['user', 'admin', 'employee'];

const findByEmail = async (email) => {
    const account = await accountModel.findOne({ email });
    if (!account) fail(404, 'Không tìm thấy tài khoản');
    return account;
};

// Cập nhật các trường cho phép; ảnh mới thay ảnh cũ trên Cloudinary
const applyProfile = async (account, { name, phone, password }, file) => {
    const error = validateProfile({ name, phone, password });
    if (error) fail(400, error);

    if (name) account.name = formatString(name);
    if (phone) account.phone = formatString(phone);
    if (password) account.password = await bcrypt.hash(password, 10);
    if (file) {
        await destroyImage(account.imagePublicId);
        account.image = file.path;
        account.imagePublicId = file.filename;
    }
};

export const getUserData = asyncHandler(async (req, res) => {
    ok(res, await findByEmail(req.user.email));
});

// Người dùng tự sửa hồ sơ của mình
export const updateMe = asyncHandler(async (req, res) => {
    const account = await findByEmail(req.user.email);
    await applyProfile(account, req.body, req.file);
    await account.save();
    ok(res, account, 'Cập nhật tài khoản thành công');
});

/* ---------- Admin ---------- */

export const getAllUsersData = asyncHandler(async (req, res) => {
    ok(res, await accountModel.find({}, 'name phone email role isLock isActive createdAt').sort({ createdAt: -1 }));
});

export const getUserDataByEmail = asyncHandler(async (req, res) => {
    ok(res, await findByEmail(req.params.email));
});

export const toggleLockAccountByEmail = asyncHandler(async (req, res) => {
    const account = await findByEmail(req.body.email);
    if (account.email === req.user.email) fail(400, 'Không thể tự khóa tài khoản của mình');
    account.isLock = !account.isLock;
    await account.save();
    ok(res, account, account.isLock ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
});

export const editAccountDataByEmail = asyncHandler(async (req, res) => {
    const account = await findByEmail(req.params.email);
    const { role, isLock } = req.body;

    await applyProfile(account, req.body, req.file);
    if (role !== undefined) {
        if (!ROLES.includes(role)) fail(400, 'Vai trò không hợp lệ');
        account.role = role;
    }
    if (isLock !== undefined) account.isLock = isLock === true || isLock === 'true';

    await account.save();
    ok(res, account, 'Tài khoản đã được cập nhật');
});

export const deleteAccountByEmail = asyncHandler(async (req, res) => {
    const account = await findByEmail(req.params.email);
    if (account.email === req.user.email) fail(400, 'Không thể tự xóa tài khoản của mình');
    await destroyImage(account.imagePublicId);
    await account.deleteOne();
    ok(res, null, 'Tài khoản đã được xóa');
});
