import axiosInstance from "../config/axios";

const API_URL = `/api/auth`;

export const login = async (email, password) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/login`, {
            email,
            password,
        });

        // Lưu token vào localStorage nếu server trả về (ngrok mode)
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            console.log("✅ Token saved to localStorage");
        }

        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Đăng nhập thất bại!";
    }
};

export const register = async (name, phone, email, password) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/register`, {
            name,
            phone,
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Đăng ký thất bại!";
    }
};

export const verifyAccount = async (email, otp) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/verify-account`, {
            email,
            otp,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Đăng ký thất bại!";
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/forgotPassword`, {
            email,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Đăng ký thất bại!";
    }
};

export const logout = async () => {
    try {
        const response = await axiosInstance.post(`${API_URL}/logout`, {});

        // Xóa token khỏi localStorage
        localStorage.removeItem("token");
        console.log("✅ Token removed from localStorage");

        return response.data;
    } catch (error) {
        // Vẫn xóa token dù API call fail
        localStorage.removeItem("token");
        throw error.response?.data?.message || "Đăng xuất thất bại!";
    }
};

export const resendOtp = async (email) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/resend-otp`, {
            email,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Gửi lại OTP thất bại";
    }
};

export const verifyOtpResetPassword = async (email, otp) => {
    try {
        const response = await axiosInstance.post(
            `${API_URL}/verify-otp-reset-password`,
            { email, otp }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Xác nhận OTP thất bại";
    }
};

export const resetPassword = async (email, password) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/reset-password`, {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Đổi mật khẩu thất bại";
    }
};
