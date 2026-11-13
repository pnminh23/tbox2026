import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { Button, Reveal, Skeleton } from '@/components/ui';
import { useAllBranches } from '@/services/branch';
import { useAvailability } from '@/services/availability';
import { useAllTimeSlots } from '@/services/timeSlots';
import { dayKeyVN, freeStarts } from '@/lib/booking.mjs';
import styles from './TonightRooms.module.scss';

const tomorrowKey = () => dayKeyVN(new Date(Date.now() + 86400000));

/** Phòng còn trống hôm nay: phòng nhiều giờ trống nhất làm thẻ lớn, mỗi phòng tối đa 3 giờ bắt đầu. */
const TonightRooms = () => {
    const { branches } = useAllBranches();
    const [picked, setPicked] = useState('');
    const branch = picked || branches?.[0]?._id;
    const today = dayKeyVN();
    const { rooms, isLoading, error, mutate } = useAvailability(branch, today);
    const { timeSlots = [] } = useAllTimeSlots();

    const list = useMemo(() => {
        if (!rooms || !timeSlots.length) return [];
        return rooms
            .map((room) => {
                const starts = freeStarts(timeSlots, new Set(room.bookedSlots), today);
                return { ...room, starts, count: starts.length };
            })
            .filter((r) => r.count)
            .sort((a, b) => b.count - a.count);
    }, [rooms, timeSlots, today]);

    const href = (query) => ({ pathname: '/bookRoom', query: { branch, date: today, ...query } });

    const body = () => {
        if (error)
            return (
                <div className={styles.state} role="alert">
                    <p>Chưa tải được danh sách phòng.</p>
                    <Button variant="outline" onClick={() => mutate()}>
                        Thử lại
                    </Button>
                </div>
            );
        if (isLoading || !rooms)
            return (
                <div className={styles.grid} aria-busy="true">
                    <Skeleton h={440} radius={18} className={styles.featured} />
                    <Skeleton h={212} radius={18} />
                    <Skeleton h={212} radius={18} />
                </div>
            );
        if (!list.length)
            return (
                <div className={styles.state}>
                    <p>Tối nay cơ sở này đã kín lịch.</p>
                    <Button variant="outline" href={href({ date: tomorrowKey() })}>
                        Xem phòng ngày mai
                    </Button>
                </div>
            );
        return (
            <Reveal className={styles.grid}>
                {list.slice(0, 3).map((room, i) => (
                    <article key={room._id} className={clsx(styles.card, i === 0 && styles.featured)}>
                        <div className={styles.photo}>
                            <Image
                                src={room.image}
                                alt={`Phòng ${room.name}`}
                                fill
                                sizes={i === 0 ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
                            />
                        </div>
                        <div className={styles.info}>
                            <h3>Phòng {room.name}</h3>
                            <p>{room.type.name}</p>
                            <ul className={styles.times} aria-label={`Giờ còn trống của phòng ${room.name}`}>
                                {room.starts.slice(0, 3).map((index) => (
                                    <li key={index}>
                                        <Link
                                            href={href({ room: room._id, start: index })}
                                            className={styles.time}
                                            aria-label={`Đặt phòng ${room.name} lúc ${timeSlots[index].start_time}`}
                                        >
                                            {timeSlots[index].start_time}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </article>
                ))}
            </Reveal>
        );
    };

    return (
        <section className={styles.section} aria-labelledby="tonight-title">
            <div className={styles.head}>
                <h2 id="tonight-title">Còn trống tối nay</h2>
                {branches?.length > 1 && (
                    <label className={styles.branch}>
                        Cơ sở
                        <select value={branch || ''} onChange={(e) => setPicked(e.target.value)}>
                            {branches.map((b) => (
                                <option key={b._id} value={b._id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
            </div>
            {body()}
            <p className={styles.hint}>Bấm một giờ để vào thẳng bước chọn phòng với giờ đó đã chọn sẵn.</p>
        </section>
    );
};

export default TonightRooms;
