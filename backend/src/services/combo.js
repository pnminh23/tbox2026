import useSWR, { mutate } from "swr";
import axiosInstance from "../config/axios";

const API_URL = `/api/combo`;

const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

export const useAllCombo = () => {
    const endpoint = `${API_URL}/get-all`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
        refreshInterval: 5000,
    });

    const mutateCombo = () => mutate(endpoint);
    return {
        allCombo: data?.data,
        isLoading,
        error,
        mutateCombo,
    };
};

export const useCombo = (_id) => {
    const endpoint = `${API_URL}/get/${_id}`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
        refreshInterval: 5000,
    });

    const mutate = () => mutate(endpoint);
    return {
        combo: data?.data,
        isLoading,
        error,
        mutate,
    };
};

export const createCombo = async (ComboData) => {
    try {
        const res = await axiosInstance.post(`${API_URL}/create`, ComboData);

        await mutate(`${API_URL}/get-all`);

        return res.data;
    } catch (error) {
        throw (
            error.response?.data || {
                success: false,
                message: "Đã xảy ra lỗi khi thêm combo",
            }
        );
    }
};
export const editComboById = async (_id, updatedData) => {
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
export const deleteComboById = async (_id) => {
    try {
        const res = await axiosInstance.delete(`${API_URL}/delete/${_id}`);
        await mutate(`${API_URL}/get-all`);
        return res.data; // trả về data để frontend xử lý nếu cần
    } catch (err) {
        throw (
            err.response?.data || {
                success: false,
                message: "Đã xảy ra lỗi khi xóa combo",
            }
        );
    }
};
