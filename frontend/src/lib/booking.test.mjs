import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    comboOptions,
    depositOf,
    estimateTotal,
    extendRange,
    isPastSlot,
    parseBookingQuery,
    rangeLabel,
    rangeMinutes,
    selectRange,
} from './booking.mjs';

// 10 khung 30 phút từ 18:00
const slots = Array.from({ length: 10 }, (_, i) => {
    const t = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    return { _id: `s${i}`, start_time: t(1080 + i * 30), end_time: t(1110 + i * 30), slot_duration: 30 };
});
const DAY = '2026-11-20';
const BEFORE = new Date('2026-11-20T08:00:00+07:00');
const none = new Set();

test('selectRange chọn đủ 120 phút từ ô bấm', () => {
    assert.deepEqual(selectRange(slots, none, DAY, 2, 120, BEFORE), { start: 2, end: 5 });
});

test('selectRange co lại trước ô đã đặt', () => {
    assert.deepEqual(selectRange(slots, new Set(['s3']), DAY, 0, 120, BEFORE), { start: 0, end: 2 });
});

test('selectRange trả null khi không đủ 60 phút hoặc ô đầu bận', () => {
    assert.equal(selectRange(slots, new Set(['s1']), DAY, 0, 120, BEFORE), null);
    assert.equal(selectRange(slots, new Set(['s0']), DAY, 0, 120, BEFORE), null);
});

test('selectRange bỏ qua khung đã qua', () => {
    const now = new Date('2026-11-20T19:00:00+07:00'); // 18:00, 18:30 đã qua (quá 10 phút)
    assert.equal(selectRange(slots, none, DAY, 0, 120, now), null);
    assert.deepEqual(selectRange(slots, none, DAY, 2, 120, now), { start: 2, end: 5 });
});

test('isPastSlot cho phép trễ 10 phút', () => {
    assert.equal(isPastSlot(DAY, slots[2], new Date('2026-11-20T19:09:00+07:00')), false);
    assert.equal(isPastSlot(DAY, slots[2], new Date('2026-11-20T19:11:00+07:00')), true);
});

test('extendRange kéo dài khi các ô giữa đều trống, từ chối khi chen ô bận', () => {
    assert.deepEqual(extendRange(slots, none, DAY, { start: 0, end: 3 }, 6, BEFORE), { start: 0, end: 6 });
    assert.equal(extendRange(slots, new Set(['s5']), DAY, { start: 0, end: 3 }, 6, BEFORE), null);
});

test('rangeMinutes và rangeLabel', () => {
    assert.equal(rangeMinutes(slots, { start: 2, end: 5 }), 120);
    assert.equal(rangeLabel(slots, { start: 2, end: 5 }), '19:00 đến 21:00');
});

test('estimateTotal theo giá phút, theo combo và trừ khuyến mãi', () => {
    assert.equal(estimateTotal({ pricePerMinute: 1000, minutes: 120, typeId: 't1' }), 120000);
    const combo = { types: [{ typeRoom: { _id: 't1' }, price: 155555 }] };
    assert.equal(
        estimateTotal({ pricePerMinute: 1000, minutes: 120, combo, typeId: 't1', discountPercent: 10 }),
        140000,
    );
});

test('depositOf làm tròn lên', () => {
    assert.equal(depositOf(155555), 77778);
});

test('comboOptions khóa combo sai thời lượng hoặc sai loại phòng', () => {
    const combos = [
        { _id: 'c1', name: 'COMBO 1', duration: 120, types: [{ typeRoom: { _id: 't1' }, price: 200000 }] },
        { _id: 'c2', name: 'COMBO 2', duration: 150, types: [{ typeRoom: { _id: 't1' }, price: 260000 }] },
        { _id: 'c3', name: 'COMBO 3', duration: 120, types: [{ typeRoom: { _id: 't2' }, price: 300000 }] },
    ];
    assert.deepEqual(comboOptions(combos, 't1', 120), [
        { _id: 'c1', name: 'COMBO 1', price: 200000, disabled: false, reason: '' },
        { _id: 'c2', name: 'COMBO 2', price: 260000, disabled: true, reason: 'Cần đặt 2 giờ 30 phút' },
        { _id: 'c3', name: 'COMBO 3', price: null, disabled: true, reason: 'Không áp dụng cho loại phòng này' },
    ]);
});

test('parseBookingQuery: ngày sai hoặc đã qua về hôm nay, số sai thành undefined', () => {
    const today = '2026-11-13';
    assert.equal(parseBookingQuery({ date: '2020-01-01' }, today).date, today);
    assert.equal(parseBookingQuery({ date: 'abc' }, today).date, today);
    const q = parseBookingQuery(
        { branch: 'b1', date: '2026-11-14', room: 'r1', start: '3', end: 'x', duration: '150', film: 'f1' },
        today,
    );
    assert.deepEqual(q, {
        branch: 'b1',
        date: '2026-11-14',
        room: 'r1',
        start: 3,
        end: undefined,
        duration: 150,
        film: 'f1',
    });
});

test('freeStarts liệt kê các giờ bắt đầu đặt được ít nhất 60 phút, tối đa `limit`', async () => {
    const { freeStarts } = await import('./booking.mjs');
    // bận s3: s0..s2 chỉ còn 90', s2 còn 30' → loại; s4 trở đi trống
    assert.deepEqual(freeStarts(slots, new Set(['s3']), DAY, { now: BEFORE, limit: 3 }), [0, 1, 4]);
    assert.deepEqual(freeStarts(slots, none, DAY, { now: BEFORE }).length, 9);
});

test('upcomingDays gắn nhãn Hôm nay / Ngày mai / thứ trong tuần', async () => {
    const { upcomingDays } = await import('./booking.mjs');
    const days = upcomingDays('2026-11-13', 4); // 13/11/2026 là thứ Sáu
    assert.deepEqual(days, [
        { date: '2026-11-13', label: 'Hôm nay', short: '13/11' },
        { date: '2026-11-14', label: 'Ngày mai', short: '14/11' },
        { date: '2026-11-15', label: 'Chủ nhật', short: '15/11' },
        { date: '2026-11-16', label: 'Thứ 2', short: '16/11' },
    ]);
    assert.equal(upcomingDays('2026-12-31', 2)[1].date, '2027-01-01');
});

test('validateContact trả lỗi theo từng ô, rỗng khi hợp lệ', async () => {
    const { validateContact } = await import('./booking.mjs');
    assert.deepEqual(validateContact({ name: ' An ', phone: '09123', email: 'a@b' }), {
        name: 'Họ tên cần ít nhất 3 ký tự',
        phone: 'Số điện thoại cần 10 hoặc 11 chữ số',
        email: 'Email chưa đúng định dạng',
    });
    assert.deepEqual(validateContact({ name: 'Minh Anh', phone: '0912345678', email: 'minh@gmail.com' }), {});
});
