import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

export const TZ = 'Asia/Ho_Chi_Minh';

export const now = () => dayjs().tz(TZ);

// 'YYYY-MM-DD' hoặc Date → dayjs đầu ngày theo giờ VN
export const vnDay = (date) =>
    (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? dayjs.tz(date, TZ) : dayjs(date).tz(TZ)).startOf(
        'day',
    );

export const dayRange = (date) => {
    const day = vnDay(date);
    return { $gte: day.toDate(), $lte: day.endOf('day').toDate() };
};

export const dayKey = (date) => vnDay(date).format('YYYY-MM-DD');

// Mốc thời gian của khung giờ 'HH:mm' trong ngày đặt
export const slotTime = (date, hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return vnDay(date).hour(h).minute(m);
};

export default dayjs;
