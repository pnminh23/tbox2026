import { useState, useEffect, useRef } from "react";
import { register, verifyAccount } from "@/services/auth";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookie from "js-cookie";
import Link from "next/link";
import clsx from "clsx";
import styles from "./FormRegister.module.scss";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { AiFillEye, AiFillEyeInvisible, AiOutlineLeft } from "react-icons/ai";
import Button from "@/components/common/Button/Button";
import dynamic from "next/dynamic";

const DynamicLoadingFullPage = dynamic(
    () => import("@/components/common/LoadingFullPage/loadingFullPage"),
    {
        ssr: false, // Tùy chọn QUAN TRỌNG nhất
        loading: () => null, // Optional: có thể trả về null hoặc một div trống trong lúc chờ load
    }
);
import { useRouter } from "next/router";
import { PATH } from "@/constants/config";
import Input from "@/components/common/Input";
import OtpVerification from "../VerifyOtp/VerifyOtp";

const FormRegister = () => {
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phonenumber, setPhonenumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState(Array(6).fill("")); // 6 ô

    const [errors, setErrors] = useState({
        name: "",
        email: "",
        phonenumber: "",
        password: "",
        confirmPassword: "",
    });
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const validateInput = (name, value) => {
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
            } else if (name === "phonenumber") {
                const phoneRegex = /^(0|\+84)(\d{9})$/; // Ví dụ kiểm tra số điện thoại Việt Nam
                newErrors.phonenumber = phoneRegex.test(value)
                    ? ""
                    : "Số điện thoại không hợp lệ. Phải bắt đầu bằng 0 hoặc +84 và có 10 chữ số.";
            } else if (name === "name") {
                const containsNumber = /\d/.test(value);
                newErrors[name] = containsNumber
                    ? "Trường này không được chứa số."
                    : "";
            } else if (name === "confirmPassword") {
                newErrors.confirmPassword =
                    value !== password ? "Mật khẩu nhập lại không khớp." : "";
            } else {
                newErrors[name] = "";
            }
            return newErrors;
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await register(name, phonenumber, email, password);

            if (response.success) {
                toast.success("Nhập mã OTP nhận từ Email");
                handleShowPopup();
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

    const handleVerifyAccount = async () => {
        const fullOtp = otp.join("");
        if (fullOtp.length === 6) {
            setLoading(true);
            try {
                const response = await verifyAccount(email, fullOtp);

                if (response.success) {
                    toast.success("Xác nhận OTP thành công");
                    router.push(PATH.Login);
                } else {
                    toast.error(response.message);
                }
            } catch (error) {
                toast.error(error);
                setLoading(false);
            }
        } else {
            toast.error("Vui lòng nhập đủ 6 số!");
        }
    };

    const handleShowPopup = () => {
        setIsPopupVisible(true);
    };

    return (
        <>
            {loading && <DynamicLoadingFullPage />} {/* Loading toàn trang */}
            <div className={styles.container}>
                {isPopupVisible ? (
                    <OtpVerification
                        email={email}
                        otp={otp}
                        setOtp={setOtp}
                        onVerify={handleVerifyAccount}
                    />
                ) : (
                    <div className={styles.registerContainer}>
                        <div>
                            <form
                                className={styles.register}
                                onSubmit={handleRegister}>
                                <div className={styles.headerRow}>
                                    <p className={styles.title}>Đăng ký</p>
                                    <AiOutlineLeft
                                        className={styles.back}
                                        onClick={() => router.back()}
                                    />
                                </div>
                                <div
                                    className={clsx(
                                        styles.groupItem,
                                        styles.relative
                                    )}>
                                    <Tippy
                                        content={errors.name}
                                        visible={!!errors.name}
                                        placement="right">
                                        <div className={styles.inputWrapper}>
                                            <Input
                                                type="text"
                                                dark
                                                rounded_20
                                                placeholder="Họ và tên"
                                                value={name}
                                                onChange={(e) => {
                                                    setName(e.target.value);
                                                    validateInput(
                                                        "name",
                                                        e.target.value
                                                    );
                                                }}
                                                onBlur={(e) =>
                                                    validateInput(
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </Tippy>
                                </div>
                                <div
                                    className={clsx(
                                        styles.groupItem,
                                        styles.relative
                                    )}>
                                    <Tippy
                                        content={errors.email}
                                        visible={!!errors.email}
                                        placement="right">
                                        <div className={styles.inputWrapper}>
                                            <Input
                                                type="text"
                                                dark
                                                rounded_20
                                                placeholder="Email"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    validateInput(
                                                        "email",
                                                        e.target.value
                                                    );
                                                }}
                                                onBlur={(e) =>
                                                    validateInput(
                                                        "email",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </Tippy>
                                </div>
                                <div
                                    className={clsx(
                                        styles.groupItem,
                                        styles.relative
                                    )}>
                                    <Tippy
                                        content={errors.phonenumber}
                                        visible={!!errors.phonenumber}
                                        placement="right">
                                        <div className={styles.inputWrapper}>
                                            <Input
                                                type="text"
                                                dark
                                                rounded_20
                                                placeholder="Số điện thoại"
                                                value={phonenumber}
                                                onChange={(e) => {
                                                    setPhonenumber(
                                                        e.target.value
                                                    );
                                                    validateInput(
                                                        "phonenumber",
                                                        e.target.value
                                                    );
                                                }}
                                                onBlur={(e) =>
                                                    validateInput(
                                                        "phonenumber",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </Tippy>
                                </div>
                                <div
                                    className={clsx(
                                        styles.groupItem,
                                        styles.relative
                                    )}>
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
                                </div>
                                <div
                                    className={clsx(
                                        styles.groupItem,
                                        styles.relative
                                    )}>
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
                                                    setConfirmPassword(
                                                        e.target.value
                                                    );
                                                    validateInput(
                                                        "confirmPassword",
                                                        e.target.value
                                                    );
                                                }}
                                                onBlur={(e) =>
                                                    validateInput(
                                                        "confirmPassword",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </Tippy>
                                </div>

                                <div className={styles.groupItem}>
                                    <Button
                                        type="submit"
                                        yellowLinear
                                        rounded_20
                                        uppercase
                                        disabled={
                                            loading ||
                                            !name ||
                                            !email ||
                                            !phonenumber ||
                                            !password ||
                                            !confirmPassword ||
                                            Object.values(errors).some((e) => e)
                                        }>
                                        Đăng ký
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default FormRegister;
