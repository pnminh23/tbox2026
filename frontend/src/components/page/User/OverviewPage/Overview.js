import { Button, Reveal, Skeleton } from '@/components/ui';
import ListInvoice from '@/components/common/ListInvoice';
import { useAllBookingByEmail, useBookingStatsByEmail } from '@/services/booking';
import { useUserData } from '@/services/account';
import { BOOKING_STATUS } from '@/constants/booking';
import { dayKeyVN } from '@/lib/booking.mjs';
import { PATH } from '@/constants/config';
import styles from './Overview.module.scss';

/** Tổng quan: số liệu nhanh + các đơn sắp tới. */
const OverviewPage = () => {
    const { user } = useUserData();
    const { booking: stats } = useBookingStatsByEmail();
    const { booking: bookings, isLoading } = useAllBookingByEmail();
    const today = dayKeyVN();
    const upcoming = (bookings || [])
        .filter(
            (b) =>
                dayKeyVN(new Date(b.date)) >= today &&
                [BOOKING_STATUS.SUCCESS, BOOKING_STATUS.PENDING].includes(b.status),
        )
        .slice(0, 3);

    const tiles = [
        ['Tổng số đơn', stats?.totalBooking],
        ['Đã hoàn thành', stats?.completedBookingsToday],
        ['Đã hủy', stats?.cancelledBookingsToday],
    ];

    return (
        <div className={styles.page}>
            <p className={styles.hello}>Chào {user?.name}, đây là các buổi xem sắp tới của bạn.</p>
            <Reveal as="dl" className={styles.tiles}>
                {tiles.map(([label, value]) => (
                    <div key={label} className={styles.tile}>
                        <dt>{label}</dt>
                        <dd>{value ?? '–'}</dd>
                    </div>
                ))}
            </Reveal>

            <section aria-labelledby="upcoming-title" className={styles.section}>
                <h2 id="upcoming-title">Sắp tới</h2>
                {isLoading && <Skeleton h={86} radius={14} />}
                {!isLoading && !upcoming.length && (
                    <div className={styles.empty}>
                        <p>Bạn chưa có buổi xem nào sắp tới.</p>
                        <Button href={PATH.BookRoom}>Đặt phòng</Button>
                    </div>
                )}
                {upcoming.map((b) => (
                    <ListInvoice key={b._id} booking={b} />
                ))}
                {upcoming.length > 0 && (
                    <Button variant="ghost" href={PATH.InvoiceDetail}>
                        Xem toàn bộ lịch sử
                    </Button>
                )}
            </section>
        </div>
    );
};

export default OverviewPage;
