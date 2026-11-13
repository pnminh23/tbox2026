import { toast } from 'react-toastify';
import { editBooking } from '@/services/booking';
import { payBooking } from '@/services/payment';
import { BOOKING_STATUS, PAY_STATUS } from '@/constants/booking';

// Hủy / hoàn tất / thanh toán đơn, dùng chung cho trang khách và admin
export const useBookingActions = (booking, onChange) => {
    const update = async (payload, successMessage) => {
        const result = await editBooking(booking._id, payload);
        if (!result.success) return toast.error(result.message);
        toast.success(successMessage);
        onChange?.();
    };

    return {
        cancel: () =>
            booking &&
            window.confirm(`Bạn có chắc muốn hủy đơn #${booking.id_booking}?`) &&
            update({ status: BOOKING_STATUS.CANCELLED }, 'Đã hủy đơn đặt phòng'),

        complete: () =>
            booking && update({ status: BOOKING_STATUS.DONE, isPay: PAY_STATUS.FULL }, 'Đã hoàn tất đơn đặt phòng'),

        pay: async (type = 'full', options) => {
            if (!booking) return;
            const result = await payBooking(booking.id_booking, type, options);
            if (!result.success) toast.error(result.message);
        },
    };
};

export default useBookingActions;
