import { formatMoney } from '@/function/formatMoney';
import styles from './BookingDetail.module.scss';
import Button from '@/components/common/Button';
import { PATH } from '@/constants/config';
import Input from '@/components/common/Input';
import { AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineRight } from 'react-icons/ai';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Popup from '@/components/common/Popup/Popup';
import useBookingActions from '@/hooks/useBookingActions';
import { useUserData } from '@/services/account';
import { canCustomerCancel, canPay } from '@/constants/booking';

const BookingDetail = ({ booking }) => {
    const router = useRouter();
    const { status } = router.query;
    const [isPopupPaymentVisible, setIsPopupPaymentVisible] = useState(false);

    const [paymentResultStatus, setPaymentResultStatus] = useState(null);

    useEffect(() => {
        if (status) {
            setPaymentResultStatus(status);

            setIsPopupPaymentVisible(true);

            // Dọn dẹp URL (xóa query param).
            const cleanUrl = `/bookRoom/${booking?.id_booking}`;
            router.replace(cleanUrl, undefined, { shallow: true });
        }
    }, [status, booking?.id_booking, router]);

    const { cancel, pay } = useBookingActions(booking);
    const { user } = useUserData();
    const isOwner = !!user && user.email === booking?.email;

    return (
        <div className="container">
            {isPopupPaymentVisible && (
                <Popup handleClose={() => setIsPopupPaymentVisible(false)}>
                    <div className={styles.popupPayment}>
                        {paymentResultStatus === 'PAID' ? (
                            <>
                                <AiOutlineCheckCircle className={styles.success} />
                                <p>Thanh toán thành công!</p>
                                <p>Đơn hàng của bạn đã được cập nhật.</p>
                            </>
                        ) : (
                            <>
                                <AiOutlineCloseCircle className={styles.cancel} />
                                <p>Thanh toán thất bại</p>
                                <p>Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
                            </>
                        )}
                        <Button rounded_10 yellowLinear onClick={() => setIsPopupPaymentVisible(false)}>
                            Đã hiểu
                        </Button>
                    </div>
                </Popup>
            )}
            <div className={styles.breadcrumb}>
                <Link href={PATH.BookRoom}>Đặt phòng</Link>
                <AiOutlineRight />
                <span>Chi tiết đơn đặt phòng</span>
            </div>
            <h5 className={styles.title}>Chi tiết đặt phòng</h5>
            <div className={styles.BookingDetailContainer}>
                <div className={styles.groupItem}>
                    <p className={styles.label}>Mã hóa đơn:</p>
                    <Input dark rounded_10 disabled value={booking?.id_booking} />
                </div>
                <div className={styles.groupItem}>
                    <p className={styles.label}>Trạng thái đơn hàng:</p>
                    <Input dark rounded_10 disabled value={booking?.status} />
                </div>
                <div className={styles.row}>
                    <div className={styles.groupItem}>
                        <p className={styles.label}>Tên khách hàng:</p>
                        <Input dark disabled rounded_10 value={booking?.name_client} />
                    </div>
                    <div className={styles.groupItem}>
                        <p className={styles.label}>Số điện thoại:</p>
                        <Input dark rounded_10 disabled value={booking?.phone} />
                    </div>
                </div>
                <div className={styles.groupItem}>
                    <p className={styles.label}>Email:</p>
                    <Input dark rounded_10 disabled value={booking?.email} />
                </div>

                <div className={styles.groupItem}>
                    <p className={styles.label}>Phim:</p>
                    <Input dark rounded_10 disabled value={booking?.film.name} />
                </div>

                <div className={styles.row}>
                    <div className={styles.groupItem}>
                        <p className={styles.label}>Cơ sở:</p>
                        <Input dark rounded_10 disabled value={booking?.room.branch.name} />
                    </div>
                    <div className={styles.groupItem}>
                        <p className={styles.label}>Phòng:</p>
                        <Input dark rounded_10 disabled value={booking?.room.name} />
                    </div>
                    <div className={styles.groupItem}>
                        <p className={styles.label}>Loại phòng:</p>
                        <Input dark rounded_10 disabled value={booking?.room.type.name} />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.groupItem}>
                        <p className={styles.label}>Ngày đặt phòng:</p>
                        <Input dark rounded_10 disabled value={dayjs(booking?.date).format('DD/MM/YYYY')} />
                    </div>
                    <div className={styles.groupItem}>
                        <p className={styles.label}>Giờ bắt đầu:</p>
                        <Input dark rounded_10 disabled value={booking?.time_slots[0].start_time} />
                    </div>
                    <div className={styles.groupItem}>
                        <p className={styles.label}>Giờ kết thúc:</p>
                        <Input dark rounded_10 disabled value={booking?.time_slots.at(-1).end_time} />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.groupItem}>
                        <p className={styles.label}>Mã khuyến mãi:</p>
                        <Input dark rounded_10 disabled value={booking?.promotion || 'Không có'} />
                    </div>
                    <div className={styles.groupItem}>
                        <p className={styles.label}>Combo:</p>
                        <Input dark rounded_10 disabled value={booking?.combo?.name || 'Không có'} />
                    </div>
                </div>
                <div className={styles.action}>
                    <div className={styles.row}>
                        <p className={styles.label}>Tổng tiền:</p>
                        <p className={styles.label}>{`${formatMoney(booking?.total_money)} - (${booking.isPay})`}</p>
                    </div>

                    <div className={styles.row}>
                        {isOwner && canCustomerCancel(booking) && (
                            <Button rounded_10 red w_fit onClick={cancel}>
                                Hủy đơn
                            </Button>
                        )}
                        {canPay(booking) ? (
                            <Button rounded_10 yellowLinear w_fit onClick={() => pay()}>
                                Thanh toán
                            </Button>
                        ) : (
                            <Button rounded_10 yellowLinear w_fit href={PATH.InvoiceDetail}>
                                Lịch sử đặt phòng
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default BookingDetail;
