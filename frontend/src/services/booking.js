import axiosInstance from "../config/axios";
import useSWR, { mutate } from "swr";

const API_URL = `/api/booking`;
const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

export const getBookedByDate = async (roomID, dateISO) =>
    axiosInstance
        .get(`${API_URL}/get-book-timeSlots-by-room/${roomID}/${dateISO}`)
        .then((r) => r.data.data);

export const createBooking = async (BookingData) => {
    try {
        const response = await axiosInstance.post(
            `${API_URL}/create`,
            BookingData
        );

        await mutate(`${API_URL}/get-booking-by-email-current`);
        await mutate(`${API_URL}/get-booking-by-email`);
        await mutate(`${API_URL}/get-booking-by-id`);

        return {
            success: true,
            message: response.data.message,
            data: response.data,
        };
    } catch (error) {
        console.error("Error creating Booking:", error);
        return {
            success: false,
            message: error?.response?.data?.message || "Something went wrong",
        };
    }
};

export const useBookingByOrderCode = (orderCode) => {
    const shouldFetch = orderCode != null && orderCode !== "";
    const endpoint = shouldFetch
        ? `${API_URL}/get-booking-by-orderCode/${orderCode}`
        : null;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });

    return {
        booking: data?.data,
        isLoading,
        isError: error,
    };
};

export const useBookingById = (id_booking) => {
    const shouldFetch = id_booking != null && id_booking !== "";
    const endpoint = shouldFetch
        ? `${API_URL}/get-booking-by-id/${id_booking}`
        : null;
    const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });

    return {
        booking: data?.data,
        isLoading,
        isError: error,
        mutate,
    };
};

export const useAllBookingByEmailCurrent = () => {
    const endpoint = `${API_URL}/get-booking-by-email-current`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });

    return {
        booking: data?.data,
        isLoading,
        isError: error,
    };
};

export const useAllBookingByEmail = () => {
    const endpoint = `${API_URL}/get-all-booking-by-email`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });

    return {
        booking: data?.data,
        isLoading,
        isError: error,
    };
};

export const useAllBookingByEmailAndMonth = (month, year) => {
    const endpoint = `${API_URL}/get-booking-by-email-and-month/${month}/${year}`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });
    const mutateBooking = () => mutate(endpoint);

    return {
        booking: data?.data,
        isLoading,
        isError: error,
        mutateBooking,
    };
};

export const useBookingStatsByEmail = () => {
    const endpoint = `${API_URL}/get-booking-stats-by-email`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });

    return {
        booking: data?.data,
        isLoading,
        isError: error,
    };
};

export const useCurrentActiveRoomsWithBookingId = () => {
    const endpoint = `${API_URL}/get-room-booking-current`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
        refreshInterval: 5000,
    });

    return {
        roomBooking: data?.data,
        isLoading,
        isError: error,
    };
};

export const useAllBookings = () => {
    const endpoint = `${API_URL}/get-all-booking`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });

    return {
        bookings: data?.data,
        isLoading,
        isError: error,
    };
};

export const useAllBookingsByDate = (date) => {
    const endpoint = `${API_URL}/get-all-booking-by-date?date=${date}`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });

    return {
        bookings: data?.data,
        isLoading,
        isError: error,
    };
};

export const useAllBookingsByMonth = (month) => {
    const endpoint = `${API_URL}/get-all-booking-by-month?month=${month}`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });

    return {
        bookings: data?.data,
        isLoading,
        isError: error,
    };
};

export const editBooking = async (_id, data) => {
    try {
        // Kiểm tra nếu data không tồn tại hoặc không có key nào
        if (!data || Object.keys(data).length === 0) {
            throw {
                success: false,
                message: "Dữ liệu chỉnh sửa không được để trống",
            };
        }

        const res = await axiosInstance.put(`${API_URL}/edit/${_id}`, data);

        await mutate(`${API_URL}/get-booking-by-email-current`);
        await mutate(`${API_URL}/get-booking-by-email`);
        await mutate(`${API_URL}/get-booking-by-id`);
        await mutate(`${API_URL}/get-all-booking`);

        return {
            success: true,
            message: "Cập nhật thành công",
            data: res.data,
        };
    } catch (err) {
        throw (
            err.response?.data ||
            err || {
                success: false,
                message: "Đã xảy ra lỗi khi chỉnh sửa film",
            }
        );
    }
};
