import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import accountModel from '../models/accountModel.js';
import { env, COOKIE_OPTIONS } from '../config/env.js';
import { sendMailSafe } from '../config/nodemailer.js';
import { otpMail } from '../services/generateEmail.js';
import { validatePassword, validateRegister } from '../validations/accountValidation.js';
import { asyncHandler, fail, ok } from '../utils/http.js';

const OTP_TTL = 5 * 60 * 1000;
const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;
const SECRET_FIELDS = '+password +verifyOTP +verifyOTPExpireAt +isResetpassword';

const newOtp = () => String(crypto.randomInt(100000, 1000000));

const findAccount = async (email) => {
    if (!email) fail(400, 'Vui lòng cung cấp email');
    const account = await accountModel.findOne({ email: email.trim() }).select(SECRET_FIELDS);
    if (!account) fail(404, 'Không tìm thấy tài khoản với email này');
    return account;
};

// Sinh OTP mới, lưu và gửi mail
const issueOtp = async (account, mail) => {
    const otp = newOtp();
    account.verifyOTP = otp;
    account.verifyOTPExpireAt = Date.now() + OTP_TTL;
    await account.save();
    sendMailSafe(otpMail({ to: account.email, otp, ...mail }));
};

const assertOtp = (account, otp) => {
    if (!otp) fail(400, 'Vui lòng nhập mã OTP');
    if (!account.verifyOTP || account.verifyOTP !== String(otp)) fail(400, 'Mã OTP không chính xác');
    if (Date.now() > account.verifyOTPExpireAt) fail(400, 'Mã OTP đã hết hạn, vui lòng yêu cầu mã mới');
};

export const register = asyncHandler(async (req, res) => {
    const error = validateRegister(req.body);
    if (error) fail(400, error);

    const { name, phone, password } = req.body;
    const email = req.body.email.trim();
    const existing = await accountModel.findOne({ email }).select(SECRET_FIELDS);
    if (existing?.isActive) fail(409, 'Email đã được sử dụng');

    // Email chưa xác thực: ghi đè thông tin đăng ký cũ
    const account = existing || new accountModel({ email });
    Object.assign(account, { name, phone, password: await bcrypt.hash(password, 10), isActive: false, isLock: false });
    await issueOtp(account, {
        subject: 'Xác nhận tài khoản - PNM BOX',
        title: 'Chào mừng đến với PNM - BOX',
        message: 'Cảm ơn bạn đã đăng ký. Dưới đây là mã OTP của bạn:',
    });
    ok(res, null, 'Mã OTP xác thực đã được gửi đến email của bạn');
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) fail(400, 'Vui lòng nhập đầy đủ email và mật khẩu');

    const account = await accountModel.findOne({ email: email.trim() }).select('+password');
    if (!account || !(await bcrypt.compare(password, account.password))) fail(401, 'Email hoặc mật khẩu không đúng');
    if (account.isLock) fail(403, 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên');
    if (!account.isActive) fail(403, 'Tài khoản chưa được kích hoạt. Vui lòng xác thực email');

    const token = jwt.sign({ id: account._id }, env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { ...COOKIE_OPTIONS, maxAge: TOKEN_TTL });
    // Trả token để FE khác domain gửi qua header Authorization
    res.json({ success: true, message: 'Đăng nhập thành công', role: account.role, token });
});

export const logout = (req, res) => {
    res.clearCookie('token', COOKIE_OPTIONS);
    ok(res, null, 'Đăng xuất thành công');
};

export const verifyEmail = asyncHandler(async (req, res) => {
    const account = await findAccount(req.body.email);
    if (account.isActive) fail(400, 'Tài khoản đã được xác thực trước đó');
    assertOtp(account, req.body.otp);

    Object.assign(account, { isActive: true, verifyOTP: '', verifyOTPExpireAt: 0 });
    await account.save();
    ok(res, null, 'Xác thực email thành công, tài khoản đã được kích hoạt');
});

export const resendOTP = asyncHandler(async (req, res) => {
    const account = await findAccount(req.body.email);
    if (account.isActive) fail(400, 'Tài khoản này đã được xác thực trước đó');
    await issueOtp(account, {
        subject: 'Mã OTP mới - PNM BOX',
        title: 'Xác thực tài khoản PNM - BOX',
        message: 'Dưới đây là mã OTP mới của bạn:',
    });
    ok(res, null, 'Mã OTP mới đã được gửi đến email của bạn');
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const account = await findAccount(req.body.email);
    await issueOtp(account, {
        subject: 'Mã OTP đặt lại mật khẩu - PNM BOX',
        title: 'Yêu cầu đặt lại mật khẩu PNM - BOX',
        message: 'Dưới đây là mã OTP để đặt lại mật khẩu:',
    });
    ok(res, null, 'Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn');
});

export const verifyOtpResetPassword = asyncHandler(async (req, res) => {
    const account = await findAccount(req.body.email);
    assertOtp(account, req.body.otp);

    // Cho phép đổi mật khẩu trong 5 phút kể từ khi xác thực OTP
    Object.assign(account, { verifyOTP: '', verifyOTPExpireAt: Date.now() + OTP_TTL, isResetpassword: true });
    await account.save();
    ok(res, null, 'Xác thực OTP thành công. Bạn có thể đặt lại mật khẩu');
});

export const resetPassword = asyncHandler(async (req, res) => {
    const error = validatePassword(req.body);
    if (error) fail(400, error);

    const account = await findAccount(req.body.email);
    if (!account.isResetpassword || Date.now() > account.verifyOTPExpireAt)
        fail(403, 'Bạn cần xác minh OTP trước khi đặt lại mật khẩu');

    Object.assign(account, {
        password: await bcrypt.hash(req.body.password, 10),
        isResetpassword: false,
        verifyOTPExpireAt: 0,
    });
    await account.save();
    ok(res, null, 'Mật khẩu đã được đặt lại thành công');
});
