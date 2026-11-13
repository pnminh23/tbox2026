import nodemailer from 'nodemailer';
import { env } from './env.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: env.USER_EMAIL, pass: env.PASSWORD_EMAIL },
});

// Gửi mail không chặn luồng chính; lỗi chỉ ghi log
export const sendMailSafe = (options) =>
    transporter
        .sendMail({ from: `"PNM - BOX" <${env.USER_EMAIL}>`, ...options })
        .catch((err) => console.error('Gửi email thất bại:', err.message));

export default transporter;
