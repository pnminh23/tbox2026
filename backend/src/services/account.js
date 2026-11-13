import useSWR, { mutate } from "swr";
import axiosInstance from "../config/axios";
import { AsyncCompiler } from "sass";

const API_URL = `/api/account`;

const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

export const useUserData = () => {
    const { data, error, isLoading } = useSWR(`${API_URL}/data`, fetcher, {
        shouldRetryOnError: false, // tránh retry nếu không cần
        revalidateOnFocus: false, // tránh refetch mỗi lần quay lại tab
        refreshInterval: 5000,
    });

    return {
        user: data?.data, // giống như response.data.data trong axios
        isLoading,
        isError: error,
    };
};

export const useAllAccounts = () => {
    const endpoint = `${API_URL}/all-account-data`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
        refreshInterval: 5000,
    });

    const mutateAccounts = () => mutate(endpoint);
    return {
        accounts: data?.data,
        isLoading,
        isError: error,
        mutateAccounts,
    };
};

export const toggleLock = async (email) => {
    try {
        const res = await axiosInstance.post(`${API_URL}/toggle-lock`, {
            email,
        });
        return res.data; // trả về data để frontend xử lý nếu cần
    } catch (err) {
        throw (
            err.response?.data || {
                success: false,
                message: "Đã xảy ra lỗi khi toggle lock",
            }
        );
    }
};

export const useAccountByEmail = (_Email) => {
    const endpoint = `${API_URL}/account-by-email/${_Email}`;
    const { data, error, isLoading } = useSWR(endpoint, fetcher, {
        shouldRetryOnError: true,
        revalidateOnFocus: true,
    });

    const mutate = () => mutate(endpoint);
    return {
        account: data?.data,
        isLoading,
        error,
        mutate,
    };
};

export const editAccountByEmail = async (email, formData) => {
    try {
        const res = await axiosInstance.put(
            `${API_URL}/edit-account-by-email/${encodeURIComponent(email)}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return res.data; // trả về data để frontend xử lý nếu cần
    } catch (err) {
        throw (
            err.response?.data || {
                success: false,
                message: "Đã xảy ra lỗi khi chỉnh sửa account",
            }
        );
    }
};

export const deleteAccountByEmail = async (email) => {
    try {
        const res = await axiosInstance.delete(`${API_URL}/delete/${email}`);
        return res.data; // trả về data để frontend xử lý nếu cần
    } catch (err) {
        throw (
            err.response?.data || {
                success: false,
                message: "Đã xảy ra lỗi khi xóa account",
            }
        );
    }
};
