import { vnDay } from '../utils/time.js';

const escapeHtml = (str = '') =>
    String(str).replace(
        /[&<>"']/g,
        (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );

const money = (n) => Number(n || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const layout = (title, body) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #F3B817; text-align: center;">${title}</h2>
        ${body}
    </div>`;

export const otpMail = ({ to, subject, title, message, otp }) => ({
    to,
    subject,
    html: layout(
        title,
        `<p style="font-size: 16px; color: #333;">${message}</p>
        <div style="background: #f3f3f3; padding: 10px; font-size: 20px; font-weight: bold; text-align: center; border-radius: 5px;">${otp}</div>
        <p style="font-size: 14px; color: #666;">Mã OTP này có hiệu lực trong <b>5 phút</b>.</p>`,
    ),
});

// booking phải được populate (room.type, room.branch, time_slots, film, combo)
export const bookingMail = ({ subject = 'Đặt phòng PNM - BOX', title, message, booking }) => {
    const rows = [
        ['Mã hóa đơn', booking.id_booking],
        ['Họ và tên', booking.name_client],
        ['Số điện thoại', booking.phone],
        ['Ngày', vnDay(booking.date).format('DD/MM/YYYY')],
        ['Giờ', `${booking.time_slots[0]?.start_time} - ${booking.time_slots.at(-1)?.end_time}`],
        ['Phim', booking.film?.name || 'Không có'],
        ['Cơ sở', booking.room?.branch?.name],
        ['Phòng', `${booking.room?.name} (${booking.room?.type?.name})`],
        ['Combo', booking.combo?.name || 'Không có'],
        ['Mã giảm giá', booking.promotion || 'Không áp dụng'],
        ['Tổng tiền', money(booking.total_money)],
        ['Còn phải trả', money(booking.payment_amount)],
        ['Trạng thái', `${booking.status} – ${booking.isPay}`],
    ];
    return {
        to: booking.email,
        subject,
        html: layout(
            title,
            `<p style="font-size: 16px; color: #333;">${message}</p>
            <div style="background: #f9f9f9; padding: 15px; font-size: 15px; border-radius: 5px;">
                ${rows.map(([k, v]) => `<p><strong>${k}:</strong> ${escapeHtml(v)}</p>`).join('')}
            </div>`,
        ),
    };
};
