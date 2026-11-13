import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const TOKEN_KEY = 'token';

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// Gửi kèm token khi FE và API khác domain (cookie bên thứ ba có thể bị trình duyệt chặn)
axiosInstance.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' && localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const fetcher = (url) => axiosInstance.get(url).then((res) => res.data);

// Lấy message lỗi từ response API
export const errorMessage = (error, fallback = 'Đã xảy ra lỗi, vui lòng thử lại') =>
    error?.response?.data?.message || error?.message || fallback;

export default axiosInstance;
