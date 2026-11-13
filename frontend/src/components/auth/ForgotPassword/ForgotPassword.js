import Input from "@/components/common/Input";
import OtpVerification from "../VerifyOtp/VerifyOtp";
import styles from "./ForgotPassword.module.scss";
import Button from "@/components/common/Button";
import { useEffect, useState } from "react";
import {
    forgotPassword,
    resetPassword,
    verifyOtpResetPassword,
} from "@/services/auth";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { useRouter } from "next/router";
import { PATH } from "@/constants/config";
import dynamic from "next/dynamic"; // <-- Cần import này

// Thay thế dòng:
// import LoadingFullPage from '@/components/common/LoadingFullPage/loadingFullPage';

// Bằng Dynamic Import:
const DynamicLoadingFullPage = dynamic(
    () => import("@/components/common/LoadingFullPage/loadingFullPage"),
    {
        ssr: false, // Vẫn là key để tránh lỗi document is not defined
        loading: () => null,
    }
);
import { toast } from "react-toastify";

const ForgotPassword = () => {
    const [otp, setOtp] = useState(Array(6).fill("")); // 6 ô
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState("email"); // 'email' | 'otp' | 'reset'
    const router = useRouter();

    const [errors, setErrors] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const storedEmail = localStorage.getItem("email");
        // Nếu email đang rỗng và có email trong localStorage thì set lại
        if (!email && storedEmail) {
            setEmail(storedEmail);
        }
    }, [step, email]);

    const validateInput = (name, value, password) => {
        setErrors((prev) => {
            let newErrors = { ...prev };
            if (!value.trim()) {
                newErrors[name] = "Trường này không được bỏ trống.";
            } else if (name === "email") {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                newErrors.email = emailRegex.test(value)
                    ? ""
                    : "Email không đúng định dạng.";
            } else if (name === "password") {
                if (value.length < 8 && !/[A-Z]/.test(value)) {
                    newErrors.password =
                        "Mật khẩu phải đủ 8 kí tự và ít nhất 1 chữ cái viết hoa.";
                } else if (value.length < 8) {
                    newErrors.password = "Mật khẩu phải đủ 8 kí tự.";
                } else if (!/[A-Z]/.test(value)) {
                    newErrors.password =
                        "Mật khẩu phải có ít nhất 1 chữ cái viết hoa.";
                } else {
                    newErrors.password = "";
                }
            } else if (name === "confirmPassword") {
                newErrors.confirmPassword =
                    value !== password ? "Mật khẩu nhập lại không khớp." : "";
            } else {
                newErrors[name] = "";
            }
            return newErrors;
        });
    };

    const handleVerifyForgotPassword = async () => {
        const fullOtp = otp.join("");
        if (fullOtp.length === 6) {
            setLoading(true);
            try {
                const response = await verifyOtpResetPassword(email, fullOtp);

                if (response.success) {
                    toast.success("Xác nhận OTP thành công");
                    setStep("reset");
                } else {
                    toast.error(response.message);
                }
            } catch (error) {
                toast.error(error);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        } else {
            toast.error("Vui lòng nhập đủ 6 số!");
        }
    };

    const handleForgotPassword = async () => {
        setLoading(true);
        try {
            const response = await forgotPassword(email);

            if (response.success) {
                toast.success("Nhập mã OTP nhận từ Email");
                localStorage.setItem("email", email);
                setStep("otp");
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error(error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setLoading(true);
        try {
            const response = await resetPassword(email, password);

            if (response.success) {
                toast.success("Đổi mật khẩu thành công");
                router.back();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error(error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading && <DynamicLoadingFullPage />} {/* Loading toàn trang */}
            <div className={styles.container}>
                {step === "email" && (
                    <div className={styles.ForgotPasswordContainer}>
                        <p className={styles.title}>
                            Vui lòng nhập Email tài khoản của bạn
                        </p>
                        <Tippy
                            content={errors.email}
                            visible={!!errors.email}
                            placement="right">
                            <div className={styles.inputWrapper}>
                                <Input
                                    rounded_20
                                    dark
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        validateInput("email", e.target.value);
                                    }}
                                />
                            </div>
                        </Tippy>
                        <Button
                            rounded_20
                            yellowLinear
                            onClick={handleForgotPassword}>
                            Xác nhận
                        </Button>
                    </div>
                )}
                {step === "otp" && (
                    <OtpVerification
                        email={email}
                        otp={otp}
                        setOtp={setOtp}
                        onVerify={handleVerifyForgotPassword}
                    />
                )}
                {step === "reset" && (
                    <div className={styles.ResetPasswordContainer}>
                        <p className={styles.title}>Đặt lại mật khẩu mới</p>
                        {/* Bạn có thể tạo thêm Input password và confirmPassword tại đây */}
                        <Tippy
                            content={errors.password}
                            visible={!!errors.password}
                            placement="right">
                            <div className={styles.inputWrapper}>
                                <Input
                                    dark
                                    rounded_20
                                    type="password"
                                    placeholder="Mật khẩu"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        validateInput(
                                            "password",
                                            e.target.value
                                        );
                                    }}
                                    onBlur={(e) =>
                                        validateInput(
                                            "password",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </Tippy>
                        <Tippy
                            content={errors.confirmPassword}
                            visible={!!errors.confirmPassword}
                            placement="right">
                            <div className={styles.inputWrapper}>
                                <Input
                                    dark
                                    rounded_20
                                    type="password"
                                    placeholder="Nhập lại mật khẩu"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        validateInput(
                                            "confirmPassword",
                                            e.target.value,
                                            password
                                        );
                                    }}
                                />
                            </div>
                        </Tippy>
                        <Button
                            rounded_20
                            yellowLinear
                            onClick={handleResetPassword}
                            disabled={
                                !password ||
                                !confirmPassword ||
                                Object.values(errors).some((e) => e)
                            }>
                            Xác nhận mật khẩu mới
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
};

export default ForgotPassword;
