import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { Button, DayPicker, Skeleton, TimeGrid } from '@/components/ui';
import { useAllBranches } from '@/services/branch';
import { useAvailability } from '@/services/availability';
import { useAllTimeSlots } from '@/services/timeSlots';
import { useFilm } from '@/services/films';
import { useBookingEvents } from '@/hooks/useBookingRealTime';
import {
    DEFAULT_MINUTES,
    dayKeyVN,
    estimateTotal,
    extendRange,
    formatDuration,
    parseBookingQuery,
    rangeLabel,
    rangeMinutes,
    selectRange,
    upcomingDays,
} from '@/lib/booking.mjs';
import BookingTicket from './BookingTicket';
import RoomCards from './RoomCards';
import style from './BookRoomPage.module.scss';

const EVENING = '14:00'; // mặc định lưới hiện từ buổi chiều

const bookedOf = (room) => new Set(room?.bookedSlots);

const BookRoomPage = () => {
    const router = useRouter();
    const today = dayKeyVN();
    const q = parseBookingQuery(router.query, today);
    const { branches } = useAllBranches();
    const branch = q.branch || branches?.[0]?._id;
    const { timeSlots: slots = [] } = useAllTimeSlots();
    const { rooms, isLoading, error, mutate } = useAvailability(branch, q.date);
    const { film } = useFilm(q.film);
    const [fullDay, setFullDay] = useState(false);
    const duration = q.duration || DEFAULT_MINUTES;
    const now = new Date();

    // Có đơn mới/đổi trạng thái → tải lại phòng trống
    useBookingEvents(() => mutate());

    // Ghi lựa chọn lên URL (chia sẻ link, quay lại không mất)
    const setQuery = (patch) => {
        const query = Object.fromEntries(
            Object.entries({ ...router.query, branch, ...patch }).filter(([, v]) => v !== undefined && v !== ''),
        );
        router.replace({ pathname: router.pathname, query }, undefined, { shallow: true, scroll: false });
    };
    const clearSelection = { room: undefined, start: undefined, end: undefined };

    const room = rooms?.find((r) => r._id === q.room);

    // Dải đang chọn suy ra từ URL; null nếu không còn hợp lệ
    const range = useMemo(() => {
        if (!room || q.start === undefined || !slots.length) return null;
        const booked = bookedOf(room);
        const r =
            q.end !== undefined
                ? extendRange(slots, booked, q.date, { start: q.start, end: q.start }, q.end)
                : selectRange(slots, booked, q.date, q.start, duration);
        return r && { roomId: room._id, ...r };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [room, q.start, q.end, q.date, duration, slots]);

    // Đến từ ô tìm phòng (có giờ, chưa có phòng): tự chọn phòng đầu tiên trống đủ thời lượng
    useEffect(() => {
        if (q.room || q.start === undefined || !rooms || !slots.length) return;
        const fit = rooms.find((r) => {
            const sel = selectRange(slots, bookedOf(r), q.date, q.start, duration);
            return sel && rangeMinutes(slots, sel) >= duration;
        });
        if (fit) setQuery({ room: fit._id });
        else {
            toast.info(
                `Lúc ${slots[q.start]?.start_time} không còn phòng trống đủ ${formatDuration(duration)}, bạn chọn giờ khác nhé`,
            );
            setQuery(clearSelection);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rooms, slots, q.room, q.start]);

    // Giờ đang chọn vừa có người đặt (socket) hoặc link cũ không còn hợp lệ
    useEffect(() => {
        if (q.room && q.start !== undefined && rooms && slots.length && !range) {
            toast.warn('Khung giờ bạn chọn vừa có người đặt, hãy chọn giờ khác');
            setQuery(clearSelection);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [range, rooms]);

    const pick = (roomId, index) => {
        const target = rooms.find((r) => r._id === roomId);
        const booked = bookedOf(target);
        if (range?.roomId === roomId && index > range.start) {
            const longer = extendRange(slots, booked, q.date, range, index);
            if (longer) return setQuery({ room: roomId, start: longer.start, end: longer.end });
        }
        const next = selectRange(slots, booked, q.date, index, duration);
        if (!next) return toast.error('Từ khung giờ này không đủ 60 phút trống liên tiếp');
        setQuery({ room: roomId, start: next.start, end: next.end });
    };

    const pickStart = (roomId, index) => {
        const next = selectRange(slots, bookedOf(rooms.find((r) => r._id === roomId)), q.date, index, duration);
        if (!next) return toast.error('Từ khung giờ này không đủ 60 phút trống liên tiếp');
        setQuery({ room: roomId, start: index, end: next.end });
    };

    const changeDuration = (minutes) => setQuery({ duration: minutes, end: undefined });

    const eveningFrom = Math.max(
        0,
        slots.findIndex((s) => s.start_time >= EVENING),
    );
    const from = fullDay ? 0 : Math.min(eveningFrom, range?.start ?? eveningFrom);

    const minutes = range ? rangeMinutes(slots, range) : 0;
    const total = range ? estimateTotal({ pricePerMinute: room.type.pricePerMinute, minutes }) : 0;
    const dayInfo = upcomingDays(today, 7).find((d) => d.date === q.date);
    const branchName = branches?.find((b) => b._id === branch)?.name || '';
    const checkoutHref = range && {
        pathname: '/bookRoom/checkout',
        query: { branch, date: q.date, room: range.roomId, start: range.start, end: range.end, film: q.film },
    };
    const ticketRows = [
        ['Cơ sở', branchName],
        ['Phòng', room && range ? `${room.name}, ${room.type.name}` : 'Chưa chọn', !range],
        ['Ngày', dayInfo ? `${dayInfo.label} ${dayInfo.short}` : q.date.split('-').reverse().join('/')],
        ['Giờ', range ? rangeLabel(slots, range) : 'Chưa chọn', !range],
        ['Phim', film?.name || 'Chọn ở bước sau, không bắt buộc', !film],
    ];

    const content = () => {
        if (error)
            return (
                <div className={style.state} role="alert">
                    <p>Chưa tải được phòng trống.</p>
                    <Button variant="outline" onClick={() => mutate()}>
                        Thử lại
                    </Button>
                </div>
            );
        if (isLoading || !rooms || !slots.length)
            return (
                <div className={style.loading} aria-busy="true" aria-label="Đang tải phòng trống">
                    {[0, 1, 2, 3].map((i) => (
                        <Skeleton key={i} h={56} radius={10} />
                    ))}
                </div>
            );
        if (!rooms.length)
            return (
                <div className={style.state}>
                    <p>Cơ sở này chưa mở phòng, bạn thử cơ sở khác nhé.</p>
                </div>
            );
        return (
            <>
                <div className={style.gridBox}>
                    <TimeGrid
                        rooms={rooms}
                        slots={slots}
                        day={q.date}
                        range={range}
                        from={from}
                        now={now}
                        onPick={pick}
                    />
                </div>
                <div className={style.cardsBox}>
                    <RoomCards
                        rooms={rooms}
                        slots={slots}
                        day={q.date}
                        range={range}
                        duration={duration}
                        now={now}
                        onPickStart={pickStart}
                        onDuration={changeDuration}
                    />
                </div>
            </>
        );
    };

    return (
        <div className={style.page}>
            <div className={style.main}>
                <div className={style.head}>
                    <h1>Chọn phòng và giờ</h1>
                    {branches?.length > 0 && (
                        <label className={style.branch}>
                            Cơ sở
                            <select
                                value={branch || ''}
                                onChange={(e) => setQuery({ branch: e.target.value, ...clearSelection })}
                            >
                                {branches.map((b) => (
                                    <option key={b._id} value={b._id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                </div>

                <DayPicker today={today} value={q.date} onChange={(date) => setQuery({ date, ...clearSelection })} />

                <div className={style.toolbar}>
                    <button type="button" className={style.toggle} onClick={() => setFullDay((v) => !v)}>
                        {fullDay ? 'Chỉ xem từ buổi chiều' : 'Xem cả ngày'}
                    </button>
                </div>

                {content()}

                <ul className={style.legend} aria-label="Chú thích">
                    <li>
                        <span className={style.swatchSel} />
                        Bạn chọn
                    </li>
                    <li>
                        <span className={style.swatchFree} />
                        Còn trống
                    </li>
                    <li>
                        <span className={style.swatchBooked} />
                        Đã có người đặt
                    </li>
                    <li className={style.legendHint}>
                        Bấm một ô trống để chọn {formatDuration(duration)}, bấm ô xa hơn cùng hàng để kéo dài.
                    </li>
                </ul>
            </div>

            <aside className={style.aside} aria-label="Vé của bạn">
                <BookingTicket rows={ticketRows} minutes={minutes} total={total} checkoutHref={checkoutHref} />
            </aside>

            {/* Cuống vé ghim đáy trên mobile */}
            <div className={clsx(style.stub, range && style.stubShow)} aria-hidden={!range}>
                <p>
                    <strong>{range ? `Phòng ${room.name}, ${rangeLabel(slots, range)}` : ''}</strong>
                    <span>Tạm tính {total.toLocaleString('vi-VN')}đ</span>
                </p>
                {checkoutHref && (
                    <Button href={checkoutHref} tabIndex={range ? 0 : -1}>
                        Giữ phòng
                    </Button>
                )}
            </div>
        </div>
    );
};

export default BookRoomPage;
