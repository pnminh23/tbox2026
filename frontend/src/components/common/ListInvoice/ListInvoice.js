import { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import { Button, Dialog, StarRating } from '@/components/ui';
import useBookingActions from '@/hooks/useBookingActions';
import { createFeedback } from '@/services/feedback';
import { refreshBookings } from '@/services/booking';
import { BOOKING_STATUS, canCustomerCancel, canPay } from '@/constants/booking';
import { formatMoney } from '@/function/formatMoney';
import { dayKeyVN } from '@/lib/booking.mjs';
import style from './ListInvoice.module.scss';

const TONE = {
    [BOOKING_STATUS.SUCCESS]: 'ok',
    [BOOKING_STATUS.DONE]: 'done',
    [BOOKING_STATUS.PENDING]: 'warn',
    [BOOKING_STATUS.CANCELLED]: 'off',
    [BOOKING_STATUS.FAILED]: 'off',
};

/** Một đơn trong lịch sử: tóm tắt + thao tác hợp lệ (thanh toán, hủy, đánh giá). */
const ListInvoice = ({ booking }) => {
    const { cancel, pay } = useBookingActions(booking);
    const [reviewing, setReviewing] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [sending, setSending] = useState(false);

    const slots = booking.time_slots || [];
    const canReview = booking.status === BOOKING_STATUS.DONE && !booking.isReviewed;

    const sendReview = async (e) => {
        e.preventDefault();
        setSending(true);
        const result = await createFeedback({ bookingId: booking._id, rating, comment: comment.trim() });
        setSending(false);
        if (!result.success) return toast.error(result.message);
        toast.success('Cảm ơn bạn đã đánh giá');
        setReviewing(false);
        refreshBookings();
    };

    return (
        <article className={style.row}>
            <div className={style.when}>
                <strong>{dayKeyVN(new Date(booking.date)).split('-').reverse().join('/')}</strong>
                <span>
                    {slots[0]?.start_time} đến {slots.at(-1)?.end_time}
                </span>
            </div>
            <div className={style.what}>
                <Link href={`/bookRoom/${booking.id_booking}`} className={style.code}>
                    Vé #{booking.id_booking}
                </Link>
                <span>
                    {booking.room?.branch?.name}, phòng {booking.room?.name}
                    {booking.film?.name ? `, ${booking.film.name}` : ''}
                </span>
            </div>
            <div className={style.money}>
                <strong>{formatMoney(booking.total_money)}</strong>
                <span className={clsx(style.status, style[TONE[booking.status]])}>{booking.status}</span>
                <span className={style.pay}>{booking.isPay}</span>
            </div>
            <div className={style.actions}>
                {canPay(booking) && <Button onClick={() => pay()}>Thanh toán</Button>}
                {canReview && (
                    <Button variant="outline" onClick={() => setReviewing(true)}>
                        Đánh giá
                    </Button>
                )}
                {booking.isReviewed && <span className={style.reviewed}>Đã đánh giá</span>}
                {canCustomerCancel(booking) && (
                    <Button variant="ghost" onClick={cancel}>
                        Hủy đơn
                    </Button>
                )}
            </div>

            <Dialog open={reviewing} onClose={() => setReviewing(false)} title="Đánh giá buổi xem">
                <form className={style.review} onSubmit={sendReview}>
                    <p className={style.muted}>
                        {booking.room?.branch?.name}, phòng {booking.room?.name}
                    </p>
                    <StarRating value={rating} onChange={setRating} />
                    <label className={style.comment}>
                        Cảm nhận của bạn
                        <textarea
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={1000}
                        />
                    </label>
                    <Button type="submit" block loading={sending} disabled={!rating}>
                        Gửi đánh giá
                    </Button>
                </form>
            </Dialog>
        </article>
    );
};

export default ListInvoice;
