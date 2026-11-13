import Image from 'next/image';
import clsx from 'clsx';
import { TimeChips } from '@/components/ui';
import { formatDuration, freeStarts } from '@/lib/booking.mjs';
import { formatMoney } from '@/function/formatMoney';
import styles from './RoomCards.module.scss';

const DURATIONS = [90, 120, 150, 180];

/** Bản mobile của lưới: mỗi phòng 1 thẻ với các giờ bắt đầu còn trống. */
const RoomCards = ({ rooms, slots, day, range, duration, now, onPickStart, onDuration }) => (
    <ul className={styles.cards}>
        {rooms.map((room) => {
            const starts = freeStarts(slots, new Set(room.bookedSlots), day, { now });
            const active = range?.roomId === room._id;
            return (
                <li
                    key={room._id}
                    className={clsx(styles.card, active && styles.active, !starts.length && styles.full)}
                >
                    <div className={styles.head}>
                        <Image src={room.image} alt="" width={56} height={42} className={styles.thumb} />
                        <p>
                            <strong>Phòng {room.name}</strong>, {room.type.name}
                            <span>{formatMoney(room.type.pricePerMinute * 60)} một giờ</span>
                        </p>
                    </div>
                    {starts.length ? (
                        <TimeChips
                            label={`Giờ bắt đầu phòng ${room.name}`}
                            items={starts.map((i) => ({
                                value: i,
                                label: slots[i].start_time,
                                ariaLabel: `Phòng ${room.name} bắt đầu ${slots[i].start_time}`,
                            }))}
                            selected={active ? range.start : undefined}
                            onPick={(i) => onPickStart(room._id, i)}
                        />
                    ) : (
                        <p className={styles.fullText}>Kín lịch ngày này</p>
                    )}
                    {active && (
                        <TimeChips
                            label="Thời lượng"
                            items={DURATIONS.map((m) => ({ value: m, label: formatDuration(m) }))}
                            selected={duration}
                            onPick={onDuration}
                        />
                    )}
                </li>
            );
        })}
    </ul>
);

export default RoomCards;
