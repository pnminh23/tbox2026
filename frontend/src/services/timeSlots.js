import useSWR, { mutate } from "swr";
import axiosInstance from "../config/axios";

const API_URL = `/api/timeSlots`;

const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

export const useAllTimeSlots = () => {
    const endpoint = `${API_URL}/get-all`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
        refreshInterval: 5000,
    });

    return {
        timeSlots: data?.data,
        isLoadingAllTimeSlots: isLoading,
        isErrorAllTimeSlots: error,
    };
};
