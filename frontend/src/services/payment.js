import axiosInstance, { errorMessage } from "../config/axios";

/**
 * Tạo link PayOS rồi mở trang thanh toán. Số tiền do server tính.
 * type: 'deposit' (cọc 50%) | 'full' (toàn bộ phần còn lại)
 * newTab: admin mở link ở tab mới để đưa khách quét
 */
export const payBooking = async (
    id_booking,
    type = "full",
    { newTab = false } = {},
) => {
    try {
        const { data } = await axiosInstance.post(`/api/payos/create`, {
            id_booking,
            type,
        });
        if (newTab) window.open(data.checkoutUrl, "_blank");
        else window.location.href = data.checkoutUrl;
        return { success: true };
    } catch (error) {
        return {
            success: false,
            message: errorMessage(error, "Không tạo được link thanh toán"),
        };
    }
};
