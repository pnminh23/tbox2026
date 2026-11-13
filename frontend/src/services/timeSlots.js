import useSWR, { mutate } from "swr";
import axiosInstance, { fetcher } from "../config/axios";

const API_URL = `/api/timeSlots`;

export const useAllTimeSlots = () => {
    const endpoint = `${API_URL}/get-all`;
    // Khung giờ gần như cố định: không cần gọi lại liên tục
    const { data, error, isLoading } = useSWR(endpoint, fetcher, { revalidateOnFocus: false });

    return {
        timeSlots: data?.data,
        isLoadingAllTimeSlots: isLoading,
        isErrorAllTimeSlots: error,
    };
};
