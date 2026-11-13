import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAvailability } from '../src/services/availability.js';

const type = { _id: 't1', name: 'VIP', base_price_per_minute: 1500 };
const room = (id, name, status = 'Active') => ({ _id: id, name, image: `${id}.jpg`, status, type });

test('gộp khung giờ đã giữ theo phòng, không trùng, dạng string', () => {
    const [r] = buildAvailability(
        [room('r1', '101')],
        [
            { room: 'r1', time_slots: ['s1', 's2'] },
            { room: 'r1', time_slots: ['s2', 's3'] },
        ],
    );
    assert.deepEqual(r.bookedSlots, ['s1', 's2', 's3']);
    assert.deepEqual(r.type, { _id: 't1', name: 'VIP', pricePerMinute: 1500 });
});

test('bỏ phòng Inactive', () => {
    const rooms = buildAvailability([room('r1', '101'), room('r2', '102', 'Inactive')], []);
    assert.deepEqual(
        rooms.map((r) => r.name),
        ['101'],
    );
});

test('sắp theo số phòng', () => {
    const rooms = buildAvailability([room('a', '201'), room('b', '103'), room('c', '101')], []);
    assert.deepEqual(
        rooms.map((r) => r.name),
        ['101', '103', '201'],
    );
});

test('không có phòng thì trả mảng rỗng', () => {
    assert.deepEqual(buildAvailability([], []), []);
});
