import { mutate } from "swr";
import axiosInstance, { TOKEN_KEY, errorMessage } from "../config/axios";
import { USER_ENDPOINT } from "./account";

const API_URL = `/api/auth`;

// POST và ném message lỗi dạng string (component hiển thị bằng toast)
const post = (path, body, fallback) =>
    axiosInstance
        .post(`${API_URL}${path}`, body)
        .then((res) => res.data)
        .catch((err) => {
            throw errorMessage(err, fallback);
        });

export const login = async (email, password) => {
    const data = await post(
        "/login",
        { email, password },
        "Đăng nhập thất bại!",
    );
    if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
    await mutate(USER_ENDPOINT);
    return data;
};

export const logout = async () => {
    try {
        return await post("/logout", {}, "Đăng xuất thất bại!");
    } finally {
        localStorage.removeItem(TOKEN_KEY);
        await mutate(USER_ENDPOINT, undefined, { revalidate: false });
    }
};

export const register = (name, phone, email, password) =>
    post("/register", { name, phone, email, password }, "Đăng ký thất bại!");

export const verifyAccount = (email, otp) =>
    post("/verify-account", { email, otp }, "Xác thực thất bại!");

export const resendOtp = (email) =>
    post("/resend-otp", { email }, "Gửi lại OTP thất bại");

export const forgotPassword = (email) =>
    post("/forgotPassword", { email }, "Gửi OTP thất bại!");

export const verifyOtpResetPassword = (email, otp) =>
    post("/verify-otp-reset-password", { email, otp }, "Xác nhận OTP thất bại");

export const resetPassword = (email, password) =>
    post("/reset-password", { email, password }, "Đổi mật khẩu thất bại");
