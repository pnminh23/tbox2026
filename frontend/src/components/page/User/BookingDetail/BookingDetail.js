import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import { Button, Skeleton, Ticket } from '@/components/ui';
import { useBookingById } from '@/services/booking';
import { useUserData } from '@/services/account';
import useBookingActions from '@/hooks/useBookingActions';
import { useBookingEvents } from '@/hooks/useBookingRealTime';
import useCountdown from '@/hooks/useCountdown';
import { BOOKING_STATUS, PAY_STATUS, canCustomerCancel, canPay } from '@/constants/booking';
import { formatMoney } from '@/function/formatMoney';
import { dayKeyVN, depositOf } from '@/lib/booking.mjs';
import { PATH } from '@/constants/config';
import styles from './BookingDetail.module.scss';

// Con dấu trên vé theo trạng thái
const STAMPS = {
    [BOOKING_STATUS.SUCCESS]: ['Đã giữ chỗ', 'ok'],
    [BOOKING_STATUS.DONE]: ['Hoàn thành', 'ok'],
    [BOOKING_STATUS.CANCELLED]: ['Đã hủy', 'void'],
    [BOOKING_STATUS.FAILED]: ['Hết hạn', 'void'],
};

const WARN_SECONDS = 120;

/** Trang vé: thông tin đơn, trạng thái thanh toán, đồng hồ giữ chỗ, các thao tác hợp lệ. */
const BookingDetail = ({ id }) => {
    const router = useRouter();
    const { booking, isLoading, isError, mutate } = useBookingById(id);
    const { user } = useUserData();
    const { cancel, pay } = useBookingActions(booking, mutate);
    const pending = booking?.status === BOOKING_STATUS.PENDING;
    const countdown = useCountdown(booking?.createdAt, pending);
    const [printing, setPrinting] = useState(false);

    // Vừa đặt xong hoặc vừa thanh toán: "in" vé rồi đóng dấu
    const { new: isNew, status: payStatus, cancel: payCancelled } = router.query;
    useEffect(() => {
        if (isNew || payStatus === 'PAID') setPrinting(true);
    }, [isNew, payStatus]);

    // Webhook thanh toán / admin đổi trạng thái → tải lại vé
    useBookingEvents((b) => b?.id_booking === booking?.id_booking && mutate());

    if (isLoading)
        return (
            <div className={styles.page} aria-busy="true">
                <Skeleton h={520} radius={18} />
            </div>
        );

    if (isError || !booking)
        return (
            <div className={styles.state} role="alert">
                <h1>Không tìm thấy vé</h1>
                <p>Mã vé không đúng hoặc đơn đã bị xóa.</p>
                <Button href={PATH.BookRoom}>Đặt phòng mới</Button>
            </div>
        );

    const isOwner = !!user && user.email === booking.email;
    const stamp = STAMPS[booking.status];
    const slots = booking.time_slots;
    const warn = countdown && !countdown.expired && countdown.minutes * 60 + countdown.seconds <= WARN_SECONDS;
    const rows = [
        ['Cơ sở', booking.room?.branch?.name],
        ['Phòng', `${booking.room?.name}, ${booking.room?.type?.name}`],
        ['Ngày', dayKeyVN(new Date(booking.date)).split('-').reverse().join('/')],
        ['Giờ', `${slots[0]?.start_time} đến ${slots.at(-1)?.end_time}`],
        ['Phim', booking.film?.name || 'Chọn tại phòng'],
        ['Combo', booking.combo?.name || 'Không'],
        ['Mã giảm giá', booking.promotion || 'Không'],
        ['Khách', `${booking.name_client}, ${booking.phone}`],
    ];

    return (
        <div className={styles.page}>
            {payCancelled === 'true' && (
                <p className={styles.notice} role="status">
                    Bạn đã hủy thanh toán. Đơn vẫn được giữ tới khi hết thời gian, bạn có thể thanh toán lại bên dưới.
                </p>
            )}

            <Ticket
                direction="vertical"
                className={clsx(styles.ticket, printing && styles.print)}
                main={
                    <div className={styles.main}>
                        <p className={styles.code}>Vé #{booking.id_booking}</p>
                        <h1>Phòng {booking.room?.name}</h1>
                        <dl>
                            {rows.map(([label, value]) => (
                                <div key={label}>
                                    <dt>{label}</dt>
                                    <dd>{value}</dd>
                                </div>
                            ))}
                        </dl>
                        {stamp && (
                            <span
                                className={clsx(styles.stamp, styles[stamp[1]], printing && styles.stampIn)}
                                aria-label={`Trạng thái: ${stamp[0]}`}
                            >
                                {stamp[0]}
                            </span>
                        )}
                    </div>
                }
                stub={
                    <div className={styles.stub}>
                        <div className={styles.money}>
                            <span>Tổng tiền</span>
                            <strong>{formatMoney(booking.total_money)}</strong>
                        </div>
                        <p className={styles.payState}>
                            {booking.isPay}
                            {booking.payment_amount > 0 &&
                                booking.isPay !== PAY_STATUS.NONE &&
                                `, còn lại ${formatMoney(booking.payment_amount)}`}
                        </p>

                        {pending && countdown && (
                            <p className={clsx(styles.timer, warn && styles.warn)} role="timer">
                                {countdown.expired
                                    ? 'Đã hết thời gian giữ chỗ'
                                    : `Phòng được giữ thêm ${countdown.minutes}:${String(countdown.seconds).padStart(2, '0')}`}
                            </p>
                        )}

                        <div className={styles.actions}>
                            {canPay(booking) &&
                                !countdown?.expired &&
                                (booking.isPay === PAY_STATUS.NONE && pending ? (
                                    <>
                                        <Button onClick={() => pay('deposit')} block>
                                            Cọc {formatMoney(depositOf(booking.total_money))}
                                        </Button>
                                        <Button variant="outline" onLight onClick={() => pay('full')} block>
                                            Trả đủ {formatMoney(booking.total_money)}
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={() => pay('full')} block>
                                        Thanh toán {formatMoney(booking.payment_amount)}
                                    </Button>
                                ))}
                            {countdown?.expired && <Button href={PATH.BookRoom}>Đặt lại</Button>}
                            {isOwner && canCustomerCancel(booking) && (
                                <Button variant="ghost" onLight onClick={cancel}>
                                    Hủy đơn
                                </Button>
                            )}
                        </div>
                    </div>
                }
            />

            <div className={styles.links}>
                {user && (
                    <Button variant="ghost" href={PATH.InvoiceDetail}>
                        Lịch sử đặt phòng
                    </Button>
                )}
                <Button variant="outline" href={PATH.BookRoom}>
                    Đặt thêm phòng
                </Button>
            </div>
        </div>
    );
};

export default BookingDetail;
