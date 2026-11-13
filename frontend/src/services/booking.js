import useSWR, { mutate } from "swr";
import axiosInstance, { errorMessage, fetcher } from "../config/axios";

const API_URL = `/api/booking`;

// Làm mới mọi cache SWR liên quan đến đơn đặt phòng
export const refreshBookings = () =>
    mutate((key) => typeof key === "string" && key.startsWith(API_URL));

// Hook SWR dùng chung; path = null thì không gọi API
const useBookingApi = (path, options) => {
    const {
        data,
        error,
        isLoading,
        mutate: revalidate,
    } = useSWR(path && `${API_URL}${path}`, fetcher, options);
    return { data: data?.data, isLoading, isError: error, mutate: revalidate };
};

export const createBooking = async (bookingData) => {
    try {
        const { data } = await axiosInstance.post(
            `${API_URL}/create`,
            bookingData,
        );
        refreshBookings();
        return { success: true, message: data.message, data };
    } catch (error) {
        return { success: false, message: errorMessage(error) };
    }
};

export const editBooking = async (_id, payload) => {
    try {
        const { data } = await axiosInstance.put(
            `${API_URL}/edit/${_id}`,
            payload,
        );
        refreshBookings();
        return { success: true, message: data.message, data: data.data };
    } catch (error) {
        return { success: false, message: errorMessage(error) };
    }
};

/* ---------- Đơn lẻ ---------- */

export const useBookingByOrderCode = (orderCode) => {
    const { data, ...rest } = useBookingApi(
        orderCode ? `/get-booking-by-orderCode/${orderCode}` : null,
    );
    return { booking: data, ...rest };
};

export const useBookingById = (id) => {
    const { data, ...rest } = useBookingApi(
        id ? `/get-booking-by-id/${id}` : null,
    );
    return { booking: data, ...rest };
};

/* ---------- Người dùng đăng nhập ---------- */

export const useAllBookingByEmailCurrent = () => {
    const { data, ...rest } = useBookingApi("/get-booking-by-email-current");
    return { booking: data, ...rest };
};

export const useAllBookingByEmail = () => {
    const { data, ...rest } = useBookingApi("/get-all-booking-by-email");
    return { booking: data, ...rest };
};

export const useAllBookingByEmailAndMonth = (month, year) => {
    const {
        data,
        mutate: revalidate,
        ...rest
    } = useBookingApi(
        month && year
            ? `/get-booking-by-email-and-month/${month}/${year}`
            : null,
    );
    return { booking: data, mutateBooking: revalidate, ...rest };
};

export const useBookingStatsByEmail = () => {
    const { data, ...rest } = useBookingApi("/get-booking-stats-by-email");
    return { booking: data, ...rest };
};

/* ---------- Admin ---------- */

export const useCurrentActiveRoomsWithBookingId = () => {
    const { data, ...rest } = useBookingApi("/get-room-booking-current", {
        refreshInterval: 30000,
    });
    return { roomBooking: data, ...rest };
};

export const useAllBookings = () => {
    const { data, ...rest } = useBookingApi("/get-all-booking");
    return { bookings: data, ...rest };
};

export const useAllBookingsByDate = (date) => {
    const { data, ...rest } = useBookingApi(
        date ? `/get-all-booking-by-date?date=${date}` : null,
    );
    return { bookings: data, ...rest };
};

export const useAllBookingsByMonth = (month) => {
    const { data, ...rest } = useBookingApi(
        month ? `/get-all-booking-by-month?month=${month}` : null,
    );
    return { bookings: data, ...rest };
};
