// Logic đặt phòng thuần (không phụ thuộc React), đồng bộ với backend/src/services/booking.js
export const PAYMENT_THRESHOLD = 150000;
export const HOLD_MINUTES = 15;
export const MIN_MINUTES = 60;
export const DEFAULT_MINUTES = 120;
const GRACE_MINUTES = 10;

const VN_DATE = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });

// Date → 'YYYY-MM-DD' theo giờ Việt Nam
export const dayKeyVN = (date = new Date()) => VN_DATE.format(date);

export const slotStart = (day, hhmm) => new Date(`${day}T${hhmm}:00+07:00`);

export const isPastSlot = (day, slot, now = new Date(), graceMinutes = GRACE_MINUTES) =>
    slotStart(day, slot.start_time).getTime() < now.getTime() - graceMinutes * 60000;

export const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return [h && `${h} giờ`, m && `${m} phút`].filter(Boolean).join(' ');
};

const isFree = (slots, booked, day, i, now) =>
    !!slots[i] && !booked.has(String(slots[i]._id)) && !isPastSlot(day, slots[i], now);

const isContiguous = (slots, i) => slots[i].end_time === slots[i + 1]?.start_time;

/** Chọn từ ô `from` đủ `minutes` phút, dừng trước ô bận/đã qua; null nếu không đủ MIN_MINUTES. */
export const selectRange = (slots, booked, day, from, minutes = DEFAULT_MINUTES, now = new Date()) => {
    if (!isFree(slots, booked, day, from, now)) return null;
    let end = from;
    let total = slots[from].slot_duration;
    while (total < minutes && isContiguous(slots, end) && isFree(slots, booked, day, end + 1, now)) {
        total += slots[++end].slot_duration;
    }
    return total >= MIN_MINUTES ? { start: from, end } : null;
};

/** Kéo dài dải đang chọn tới ô `to` nếu mọi ô ở giữa đều trống và liền nhau. */
export const extendRange = (slots, booked, day, range, to, now = new Date()) => {
    if (!range || to <= range.start) return null;
    for (let i = range.start; i <= to; i++) {
        if (!isFree(slots, booked, day, i, now) || (i < to && !isContiguous(slots, i))) return null;
    }
    return { start: range.start, end: to };
};

export const rangeMinutes = (slots, { start, end }) =>
    slots.slice(start, end + 1).reduce((sum, s) => sum + s.slot_duration, 0);

export const rangeLabel = (slots, { start, end }) => `${slots[start].start_time} đến ${slots[end].end_time}`;

const idOf = (v) => String(v?._id ?? v);

const comboPrice = (combo, typeId) => combo.types.find((t) => idOf(t.typeRoom) === String(typeId))?.price ?? null;

/** Tạm tính giống server: combo theo loại phòng hoặc giá/phút × số phút, trừ % rồi làm tròn. */
export const estimateTotal = ({ pricePerMinute, minutes, combo, typeId, discountPercent = 0 }) => {
    const base = combo ? (comboPrice(combo, typeId) ?? 0) : pricePerMinute * minutes;
    return Math.round(base * (1 - discountPercent / 100));
};

export const depositOf = (total) => Math.ceil(total / 2);

/** Combo kèm trạng thái dùng được cho loại phòng + thời lượng đang chọn. */
export const comboOptions = (combos, typeId, minutes) =>
    combos.map((combo) => {
        const price = comboPrice(combo, typeId);
        const reason =
            price == null
                ? 'Không áp dụng cho loại phòng này'
                : combo.duration !== minutes
                  ? `Cần đặt ${formatDuration(combo.duration)}`
                  : '';
        return { _id: combo._id, name: combo.name, price, disabled: !!reason, reason };
    });

const toIndex = (v) => {
    const n = Number(v);
    return v !== undefined && v !== '' && Number.isInteger(n) && n >= 0 ? n : undefined;
};
const toText = (v) => (typeof v === 'string' && v ? v : undefined);

/** Đọc lựa chọn từ URL; ngày sai định dạng hoặc đã qua thì về `today`. */
export const parseBookingQuery = (query, today) => {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(query.date) && query.date >= today ? query.date : today;
    return {
        branch: toText(query.branch),
        date,
        room: toText(query.room),
        start: toIndex(query.start),
        end: toIndex(query.end),
        duration: toIndex(query.duration),
        film: toText(query.film),
    };
};

/** Các ô có thể bắt đầu một lượt đặt tối thiểu MIN_MINUTES phút (lấy tối đa `limit` ô). */
export const freeStarts = (slots, booked, day, { now = new Date(), limit = Infinity } = {}) => {
    const result = [];
    for (let i = 0; i < slots.length && result.length < limit; i++) {
        if (selectRange(slots, booked, day, i, MIN_MINUTES, now)) result.push(i);
    }
    return result;
};

const WEEKDAYS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

/** n ngày liên tiếp từ `today` ('YYYY-MM-DD') kèm nhãn hiển thị. */
export const upcomingDays = (today, n = 7) => {
    const [y, m, d] = today.split('-').map(Number);
    return Array.from({ length: n }, (_, i) => {
        const date = new Date(Date.UTC(y, m - 1, d + i));
        const iso = date.toISOString().slice(0, 10);
        const label = i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : WEEKDAYS[date.getUTCDay()];
        return { date: iso, label, short: `${iso.slice(8, 10)}/${iso.slice(5, 7)}` };
    });
};

/** Kiểm tra thông tin liên hệ của khách vãng lai; trả { ô: lỗi }, rỗng khi hợp lệ. */
export const validateContact = ({ name = '', phone = '', email = '' }) => {
    const errors = {};
    if (name.trim().length < 3) errors.name = 'Họ tên cần ít nhất 3 ký tự';
    if (!/^[0-9]{10,11}$/.test(phone.trim())) errors.phone = 'Số điện thoại cần 10 hoặc 11 chữ số';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Email chưa đúng định dạng';
    return errors;
};
