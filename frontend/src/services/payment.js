import axiosInstance from "../config/axios";

const API_URL = `/api/payos`;

export const createPayment = async (data) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/create`, data);

        return {
            success: true,
            checkoutUrl: response.data.checkoutUrl,
        };
    } catch (error) {
        console.error("Error creating Booking:", error);
        return {
            success: false,
            message: error?.response?.data?.message || "Something went wrong",
        };
    }
};
