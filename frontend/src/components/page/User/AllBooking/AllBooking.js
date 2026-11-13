import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Button, Skeleton } from '@/components/ui';
import ListInvoice from '@/components/common/ListInvoice';
import { useAllBookingByEmail } from '@/services/booking';
import { BOOKING_STATUS } from '@/constants/booking';
import { dayKeyVN } from '@/lib/booking.mjs';
import { PATH } from '@/constants/config';
import style from './AllBooking.module.scss';

const UPCOMING = [BOOKING_STATUS.SUCCESS, BOOKING_STATUS.PENDING];
const VIEWS = [
    ['upcoming', 'Sắp tới'],
    ['past', 'Đã qua'],
    ['all', 'Tất cả'],
];

/** Lịch sử đặt phòng: 1 nguồn dữ liệu, lọc trực tiếp khi render. */
const AllBooking = () => {
    const { booking: bookings, isLoading, isError } = useAllBookingByEmail();
    const [view, setView] = useState('upcoming');
    const [month, setMonth] = useState('');
    const [code, setCode] = useState('');
    const today = dayKeyVN();

    const list = useMemo(
        () =>
            (bookings || []).filter((b) => {
                const day = dayKeyVN(new Date(b.date));
                const upcoming = day >= today && UPCOMING.includes(b.status);
                return (
                    (view === 'all' || (view === 'upcoming') === upcoming) &&
                    (!month || day.startsWith(month)) &&
                    (!code || String(b.id_booking).includes(code.trim()))
                );
            }),
        [bookings, view, month, code, today],
    );

    return (
        <section className={style.wrap}>
            <div className={style.toolbar}>
                <div role="group" aria-label="Xem đơn" className={style.views}>
                    {VIEWS.map(([key, label]) => (
                        <button
                            key={key}
                            type="button"
                            aria-pressed={view === key}
                            className={clsx(style.view, view === key && style.active)}
                            onClick={() => setView(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <label className={style.input}>
                    <span className="sr-only">Lọc theo tháng</span>
                    <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
                </label>
                <label className={style.input}>
                    <span className="sr-only">Tìm theo mã vé</span>
                    <input
                        type="search"
                        inputMode="numeric"
                        placeholder="Tìm mã vé"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                </label>
            </div>

            {isError && <p role="alert">Chưa tải được lịch sử đặt phòng, bạn thử tải lại trang nhé.</p>}
            {isLoading && (
                <div className={style.list} aria-busy="true">
                    {[0, 1, 2].map((i) => (
                        <Skeleton key={i} h={86} radius={14} />
                    ))}
                </div>
            )}
            {!isLoading && bookings && !list.length && (
                <div className={style.empty}>
                    <p>{bookings.length ? 'Không có đơn nào khớp bộ lọc.' : 'Bạn chưa đặt phòng lần nào.'}</p>
                    <Button href={PATH.BookRoom}>Đặt phòng</Button>
                </div>
            )}
            <div className={style.list}>
                {list.map((b) => (
                    <ListInvoice key={b._id} booking={b} />
                ))}
            </div>
        </section>
    );
};

export default AllBooking;
