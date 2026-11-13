import axios from "axios";

// Tạo axios instance với cấu hình mặc định
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true", // Bỏ qua warning của ngrok
    },
});

// Interceptor để xử lý request
axiosInstance.interceptors.request.use(
    (config) => {
        // Thêm token từ localStorage vào header nếu có (cho ngrok mode)
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý response
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Xử lý lỗi chung
        if (error.response?.status === 401) {
            // Có thể redirect đến trang login
            console.error("Unauthorized");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
