import useSWR, { mutate } from "swr";
import axiosInstance, { fetcher } from "../config/axios";

const API_URL = `/api/account`;
export const USER_ENDPOINT = `${API_URL}/data`;
const ALL_ENDPOINT = `${API_URL}/all-account-data`;
const multipart = { headers: { "Content-Type": "multipart/form-data" } };

// Gọi API, ném lại response lỗi của server để component hiển thị message
const request = (promise, fallback) =>
    promise
        .then((res) => res.data)
        .catch((err) => {
            throw err.response?.data || { success: false, message: fallback };
        });

// Người dùng hiện tại; null nếu chưa đăng nhập
export const useUserData = () => {
    const { data, error, isLoading } = useSWR(USER_ENDPOINT, fetcher, {
        shouldRetryOnError: false,
        revalidateOnFocus: true,
    });
    return { user: data?.data, isLoading, isError: error };
};

export const refreshUser = () => mutate(USER_ENDPOINT);

export const updateMe = async (formData) => {
    const res = await request(
        axiosInstance.put(`${API_URL}/me`, formData, multipart),
        "Cập nhật thất bại",
    );
    await refreshUser();
    return res;
};

/* ---------- Admin ---------- */

export const useAllAccounts = () => {
    const { data, error, isLoading } = useSWR(ALL_ENDPOINT, fetcher, {
        revalidateOnFocus: true,
    });
    return {
        accounts: data?.data,
        isLoading,
        isError: error,
        mutateAccounts: () => mutate(ALL_ENDPOINT),
    };
};

export const useAccountByEmail = (email) => {
    const endpoint = email
        ? `${API_URL}/account-by-email/${encodeURIComponent(email)}`
        : null;
    const {
        data,
        error,
        isLoading,
        mutate: revalidate,
    } = useSWR(endpoint, fetcher);
    return { account: data?.data, isLoading, error, mutate: revalidate };
};

export const toggleLock = (email) =>
    request(
        axiosInstance.post(`${API_URL}/toggle-lock`, { email }),
        "Đã xảy ra lỗi khi khóa tài khoản",
    );

export const editAccountByEmail = (email, formData) =>
    request(
        axiosInstance.put(
            `${API_URL}/edit-account-by-email/${encodeURIComponent(email)}`,
            formData,
            multipart,
        ),
        "Đã xảy ra lỗi khi chỉnh sửa tài khoản",
    );

export const deleteAccountByEmail = (email) =>
    request(
        axiosInstance.delete(`${API_URL}/delete/${encodeURIComponent(email)}`),
        "Đã xảy ra lỗi khi xóa tài khoản",
    );
