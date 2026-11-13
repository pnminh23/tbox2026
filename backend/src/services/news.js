import useSWR, { mutate } from "swr";
import axiosInstance from "../config/axios";

const API_URL = `/api/news`;

const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

export const useAllNews = () => {
    const endpoint = `${API_URL}/get-all`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });

    return {
        allNews: data?.data,
        isLoading,
        error,
    };
};

export const useNews = (_id) => {
    const endpoint = `${API_URL}/get/${_id}`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });

    return {
        news: data?.data,
        isLoading,
        error,
    };
};

export const createNews = async (data) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/create`, data);

        await mutate(`${API_URL}/get-all`);

        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Something went wrong",
        };
    }
};
export const editNewsById = async (_id, updatedData) => {
    try {
        await axiosInstance.put(`${API_URL}/edit/${_id}`, updatedData);

        // Cập nhật lại cache của SWR sau khi edit
        await mutate(`${API_URL}/get-all`);

        return {
            success: true,
            message: "Cập nhật combo thành công",
        };
    } catch (error) {
        return {
            success: false,
            error: error?.response?.data?.message || "Không thể cập nhật combo",
        };
    }
};
export const deleteNewsById = async (_id) => {
    try {
        const res = await axiosInstance.delete(`${API_URL}/delete/${_id}`);
        await mutate(`${API_URL}/get-all`);
        return {
            success: true,
            message: res.message,
        };
    } catch (err) {
        throw (
            err.response?.data || {
                success: false,
                message: "Đã xảy ra lỗi khi xóa combo",
            }
        );
    }
};
