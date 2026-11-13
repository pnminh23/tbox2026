import Input from '@/components/common/Input';
import style from './BookingManger.module.scss';
import Button from '@/components/common/Button';
import React, { useEffect, useState } from 'react';
import { useAllBranches } from '@/services/branch';
import Selection from '@/components/common/Selection';
import { useRoomByBranch } from '@/services/room';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { editBooking, useBookingById, useCurrentActiveRoomsWithBookingId } from '@/services/booking';
import { formatMoney } from '@/function/formatMoney';
import { toast } from 'react-toastify';
import { createPayment } from '@/services/payment';
const dateNow = new Date();
const BookingManger = () => {
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const { roomBooking } = useCurrentActiveRoomsWithBookingId();
    const { booking } = useBookingById(selectedBooking);
    const { roomsByBranch } = useRoomByBranch(selectedBranch);
    const { branches } = useAllBranches();
    const BranchOptions = branches?.map((branch) => ({
        name: branch.name,
        id: branch._id,
    }));

    const handleCompleteBooking = async () => {
        if (!booking) return; // Đảm bảo đã có booking được chọn

        try {
            // Gọi service với status mới
            const result = await editBooking(booking._id, {
                status: 'HOÀN THÀNH',
            });
            if (result.success) {
                toast.success('Đã hoàn tất đơn đặt phòng!');
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi hoàn tất đơn.');
            console.error(error);
        }
    };
    const handleCancelBooking = async () => {
        if (!booking) return; // Đảm bảo đã có booking được chọn

        // Thêm một bước xác nhận trước khi hủy
        if (!window.confirm(`Bạn có chắc muốn hủy đơn hàng "${booking._id}" không?`)) {
            return;
        }

        try {
            const result = await editBooking(booking._id, {
                status: 'ĐÃ HỦY',
            });
            if (result.success) {
                toast.success('Đã hủy đơn đặt phòng thành công!');
            }
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi hủy đơn.');
            console.error(error);
        }
    };

    const handlePayment = async () => {
        const expiredAt = dayjs().add(5, 'minute').unix();
        const newPayment = {
            id_booking: booking?.id_booking,
            email: booking?.email,
            amount: booking?.payment_amount || 0,
            description: `${booking?._id}`,
            returnUrl: `http://localhost:3000/bookRoom/${booking.id_booking}`,
            cancelUrl: `http://localhost:3000/bookRoom/${booking.id_booking}`,
            expiredAt,
        };
        try {
            const result = await createPayment(newPayment); // gọi đến backend
            if (result?.checkoutUrl) {
                window.open(result.checkoutUrl, '_blank'); // chuyển tới trang thanh toán
            } else {
                alert('Không lấy được link thanh toán!');
            }
        } catch (error) {
            console.error('Lỗi khi tạo đơn hàng:', error);
            alert('Có lỗi xảy ra khi khởi tạo thanh toán!');
        }
    };

    return (
        <div className={style.container}>
            <div className={style.selectionBranch}>
                <Selection
                    options={BranchOptions}
                    optionLabel="name"
                    defaultValue="Chọn cơ sở"
                    optionValue="id"
                    onChange={(value) => setSelectedBranch(value)}
                />
            </div>

            <div className={style.content}>
                <div className={style.listRoomContainer}>
                    <div className={style.listRoom}>
                        {roomsByBranch?.map((room) => {
                            // Kiểm tra room này có đang được đặt không
                            const bookingInfo = roomBooking?.find((item) => item.roomId === room._id);
                            console.log('bookingInfo', bookingInfo);
                            const isBookedNow = !!bookingInfo;

                            return (
                                <div
                                    className={clsx(
                                        style.room,
                                        selectedRoom === room._id && style.active,
                                        isBookedNow && style.booked // Thêm class nếu đang được đặt
                                    )}
                                    key={room._id}
                                    onClick={() => {
                                        setSelectedRoom(room._id);
                                        setSelectedBooking(bookingInfo?.bookingId || null);
                                        console.log('selectedbooking: ', selectedBooking);
                                    }}
                                >
                                    {room.name}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className={style.bookingContainer}>
                    {!booking ? (
                        <p>Phòng đang trống</p>
                    ) : (
                        <div className={style.bookingDetail}>
                            <div className={style.groupItem}>
                                <p className={style.label}>Mã hóa đơn:</p>
                                <Input rounded_10 disabled value={booking.id_booking} />
                            </div>
                            <div className={style.row}>
                                <div className={style.groupItem}>
                                    <p className={style.label}>Tên khách hàng:</p>
                                    <Input disabled rounded_10 value={booking?.name_client} />
                                </div>
                                <div className={style.groupItem}>
                                    <p className={style.label}>Số điện thoại:</p>
                                    <Input rounded_10 disabled value={booking?.phone} />
                                </div>
                            </div>
                            <div className={style.groupItem}>
                                <p className={style.label}>Email:</p>
                                <Input rounded_10 disabled value={booking?.email} />
                            </div>

                            <div className={style.groupItem}>
                                <p className={style.label}>Phim:</p>
                                <Input rounded_10 disabled value={booking?.film.name} />
                            </div>

                            <div className={style.row}>
                                <div className={style.groupItem}>
                                    <p className={style.label}>Cơ sở:</p>
                                    <Input rounded_10 disabled value={booking?.room.branch.name} />
                                </div>
                                <div className={style.groupItem}>
                                    <p className={style.label}>Phòng:</p>
                                    <Input rounded_10 disabled value={booking?.room.name} />
                                </div>
                                <div className={style.groupItem}>
                                    <p className={style.label}>Loại phòng:</p>
                                    <Input rounded_10 disabled value={booking?.room.type.name} />
                                </div>
                            </div>
                            <div className={style.row}>
                                <div className={style.groupItem}>
                                    <p className={style.label}>Giờ bắt đầu:</p>
                                    <Input rounded_10 disabled value={booking?.time_slots[0].start_time} />
                                </div>
                                <div className={style.groupItem}>
                                    <p className={style.label}>Giờ kết thúc:</p>
                                    <Input rounded_10 disabled value={booking?.time_slots.at(-1).end_time} />
                                </div>
                                <div className={style.groupItem}>
                                    <p className={style.label}>Mã khuyến mãi:</p>
                                    <Input rounded_10 disabled value={booking?.promotion?.name || 'Không có'} />
                                </div>
                            </div>
                            <div className={style.action}>
                                <div className={style.row}>
                                    <p className={style.label}>Tổng tiền:</p>
                                    <p className={style.label}>{`${formatMoney(booking?.total_money)} - (${
                                        booking.isPay
                                    })`}</p>
                                </div>

                                <div className={style.row}>
                                    {/* Ẩn nút Hủy nếu đã hoàn tất */}
                                    {booking?.status !== 'HOÀN THÀNH' && (
                                        <Button rounded_10 red w_fit onClick={handleCancelBooking}>
                                            Hủy đơn
                                        </Button>
                                    )}

                                    {/* Nếu đã thanh toán */}
                                    {booking?.isPay === 'ĐÃ THANH TOÁN' ? (
                                        booking?.status === 'HOÀN THÀNH' ? (
                                            <Button rounded_10 w_fit disabled yellowLinear>
                                                Đã hoàn tất
                                            </Button>
                                        ) : (
                                            <Button rounded_10 yellowLinear w_fit onClick={handleCompleteBooking}>
                                                Hoàn tất
                                            </Button>
                                        )
                                    ) : (
                                        // Nếu chưa thanh toán
                                        <Button rounded_10 yellowLinear w_fit onClick={handlePayment}>
                                            Thanh toán
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingManger;
