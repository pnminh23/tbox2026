import useSWR, { mutate } from "swr";
import axiosInstance, { fetcher } from "../config/axios";

const API_URL = `/api/review`;

export const useFeedbackByBranch = (branchId) => {
    const shouldFetch = branchId != null && branchId !== "";
    const endpoint = shouldFetch
        ? `${API_URL}/get-by-branch/${branchId}`
        : null;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });

    return {
        feedbacks: data?.data,
        isLoading,
        error,
    };
};

export const createFeedback = async (data) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/create`, data);

        // Sau khi tạo xong, cập nhật danh sách branch

        return {
            success: true,
            message: response.data.message,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Gửi đánh giá thất bại",
        };
    }
};
