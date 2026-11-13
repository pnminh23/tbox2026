import { Button, PriceTag, Ticket } from '@/components/ui';
import { PAYMENT_THRESHOLD, depositOf, formatDuration } from '@/lib/booking.mjs';
import { formatMoney } from '@/function/formatMoney';
import styles from './BookingTicket.module.scss';

/**
 * Vé tóm tắt lựa chọn. Mỗi dòng có key = giá trị nên nháy sáng khi đổi.
 * rows: [[nhãn, giá trị, muted?]]; checkoutHref = null khi chưa chọn giờ
 */
const BookingTicket = ({ rows, minutes, total, checkoutHref }) => (
    <Ticket
        direction="vertical"
        className={styles.ticket}
        main={
            <div className={styles.main}>
                <h2>Vé của bạn</h2>
                <dl>
                    {rows.map(([label, value, muted]) => (
                        <div key={label} className={styles.row}>
                            <dt>{label}</dt>
                            <dd key={value} className={muted ? styles.muted : styles.flash}>
                                {value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        }
        stub={
            <div className={styles.stub}>
                <div className={styles.total}>
                    <span>Tạm tính{minutes ? ` cho ${formatDuration(minutes)}` : ''}</span>
                    <PriceTag value={total} className={styles.price} />
                </div>
                <p className={styles.note}>
                    {total > PAYMENT_THRESHOLD
                        ? `Đơn trên 150.000đ cần cọc tối thiểu ${formatMoney(depositOf(total))}. Phòng được giữ 15 phút sau khi bạn bấm thanh toán.`
                        : 'Đơn từ 150.000đ trở xuống không cần thanh toán trước.'}
                </p>
                {checkoutHref ? (
                    <Button href={checkoutHref} size="lg" block>
                        Giữ phòng này
                    </Button>
                ) : (
                    <p className={styles.empty}>Chọn một ô trống trên lưới</p>
                )}
            </div>
        }
    />
);

export default BookingTicket;
