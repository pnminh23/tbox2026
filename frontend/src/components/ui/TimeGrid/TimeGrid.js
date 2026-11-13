import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { isPastSlot } from '@/lib/booking.mjs';
import styles from './TimeGrid.module.scss';

const MOVES = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };

/**
 * Lưới phòng × khung giờ. Chỉ 1 ô nhận Tab, phím mũi tên để di chuyển, Enter/Space để chọn.
 * range: { roomId, start, end } | null; onPick(roomId, slotIndex)
 */
const TimeGrid = ({ rooms, slots, day, range, from = 0, now, onPick }) => {
    const gridRef = useRef(null);
    const indexes = useMemo(() => slots.map((_, i) => i).slice(from), [slots, from]);

    const rows = useMemo(
        () =>
            rooms.map((room) => {
                const booked = new Set(room.bookedSlots);
                return {
                    room,
                    cells: indexes.map((i) => {
                        const slot = slots[i];
                        const past = isPastSlot(day, slot, now);
                        const isBooked = !past && booked.has(String(slot._id));
                        const sel = range?.roomId === room._id && i >= range.start && i <= range.end;
                        return { i, slot, past, booked: isBooked, sel, free: !past && !isBooked };
                    }),
                };
            }),
        [rooms, indexes, slots, day, range, now],
    );

    // Ô nhận Tab: ô đầu dải đang chọn, nếu không thì ô trống đầu tiên
    const firstFree = () => {
        for (const [r, row] of rows.entries()) {
            const c = row.cells.findIndex((cell) => cell.free);
            if (c >= 0) return [r, c];
        }
        return [0, 0];
    };
    const selRow = rows.findIndex((row) => row.room._id === range?.roomId);
    const [active, setActive] = useState(null);
    const [ar, ac] =
        active ?? (selRow >= 0 ? [selRow, rows[selRow].cells.findIndex((c) => c.i === range.start)] : firstFree());

    const onKeyDown = (e) => {
        const move = MOVES[e.key];
        if (!move) return;
        e.preventDefault();
        let [r, c] = [ar, ac];
        // Đi tiếp theo hướng tới khi gặp ô bấm được
        for (let step = 0; step < 40; step++) {
            r += move[0];
            c += move[1];
            const btn = gridRef.current?.querySelector(`[data-r="${r}"][data-c="${c}"] button`);
            if (btn) {
                setActive([r, c]);
                return btn.focus();
            }
            if (r < 0 || r >= rows.length || c < 0 || c >= indexes.length) return;
        }
    };

    return (
        <div ref={gridRef} role="grid" aria-label="Lưới giờ trống" className={styles.grid} onKeyDown={onKeyDown}>
            <div role="row" className={styles.headRow}>
                <span role="columnheader" className={styles.corner}>
                    Phòng
                </span>
                <div className={styles.hours} aria-hidden="true">
                    {indexes.map((i) => (
                        <span key={i}>
                            {slots[i].start_time.endsWith(':00') ? `${parseInt(slots[i].start_time, 10)}h` : ''}
                        </span>
                    ))}
                </div>
            </div>

            {rows.map(({ room, cells }, r) => (
                <div role="row" key={`${day}-${room._id}`} className={styles.row} style={{ '--row': r }}>
                    <div role="rowheader" className={styles.roomCell}>
                        <Image src={room.image} alt="" width={52} height={40} className={styles.thumb} />
                        <span>
                            <strong>Phòng {room.name}</strong>
                            <small>{room.type.name}</small>
                        </span>
                    </div>
                    <div className={styles.cells}>
                        {cells.map((cell, c) => {
                            const label = `Phòng ${room.name} lúc ${cell.slot.start_time}`;
                            return (
                                <div
                                    key={cell.i}
                                    role="gridcell"
                                    data-r={r}
                                    data-c={c}
                                    aria-selected={cell.sel}
                                    aria-label={
                                        cell.free ? undefined : `${label}, ${cell.past ? 'đã qua' : 'đã có người đặt'}`
                                    }
                                    className={clsx(
                                        styles.cell,
                                        cell.booked && styles.booked,
                                        cell.past && styles.past,
                                    )}
                                >
                                    {cell.free && (
                                        <button
                                            type="button"
                                            tabIndex={r === ar && c === ac ? 0 : -1}
                                            aria-label={`${label}${cell.sel ? ', đang chọn' : ', còn trống'}`}
                                            className={clsx(styles.slot, cell.sel && styles.sel)}
                                            style={cell.sel ? { '--d': `${(cell.i - range.start) * 25}ms` } : undefined}
                                            onFocus={() => setActive([r, c])}
                                            onClick={() => onPick(room._id, cell.i)}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TimeGrid;
