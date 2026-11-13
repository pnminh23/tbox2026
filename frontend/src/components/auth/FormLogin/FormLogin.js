import { useState, useEffect } from "react";
import { login } from "@/services/auth";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookie from "js-cookie";
import Link from "next/link";
import clsx from "clsx";
import style from "./FormLogin.module.scss";
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

const FormLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ email: "", password: "" });
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
            } else {
                newErrors[name] = "";
            }
            return newErrors;
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (errors.email || errors.password || !email || !password) {
            toast.error("Vui lòng kiểm tra lại thông tin!");
            return;
        }

        setLoading(true);
        try {
            const response = await login(email, password);

            if (response.success) {
                toast.success("Đăng nhập thành công!");
                localStorage.setItem("email", email);
                
                // Redirect theo role
                const redirectPath = response.role === 'admin' ? '/admin' : '/';
                
                setTimeout(() => {
                    router.push(redirectPath);
                }, 1500);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error(error);
            setLoading(false);
        }
    };
    // useEffect(() => {
    //     const handleRouteChange = () => setLoading(false);
    //     window.addEventListener('load', handleRouteChange);
    //     return () => window.removeEventListener('load', handleRouteChange);
    // }, []);
    return (
        <>
            {loading && <DynamicLoadingFullPage />} {/* Loading toàn trang */}
            <div className={style.container}>
                <form className={style.login} onSubmit={handleLogin}>
                    <div className={style.headerRow}>
                        <h3>Đăng nhập</h3>
                        <p className={style.back}>
                            <AiOutlineLeft onClick={() => router.back()} />
                            Trang chủ
                        </p>
                    </div>
                    <div className={clsx(style.groupItem, style.relative)}>
                        <Tippy
                            content={errors.email}
                            visible={!!errors.email}
                            placement="right">
                            <div className={style.inputWrapper}>
                                <Input
                                    type="text"
                                    dark
                                    rounded_20
                                    placeholder="Email hoặc số điện thoại"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        validateInput("email", e.target.value);
                                    }}
                                    onBlur={(e) =>
                                        validateInput("email", e.target.value)
                                    }
                                />
                            </div>
                        </Tippy>
                    </div>
                    <div className={clsx(style.groupItem, style.relative)}>
                        <Tippy
                            content={errors.password}
                            visible={!!errors.password}
                            placement="right">
                            <div className={style.inputWrapper}>
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
                    <div className={clsx(style.groupItem, style.flexEnd)}>
                        <Link href={PATH.ForgotPassword}>Quên mật khẩu?</Link>
                    </div>
                    <div className={style.groupItem}>
                        <Button
                            type="submit"
                            yellowLinear
                            rounded_20
                            uppercase
                            disabled={
                                !!errors.email ||
                                !!errors.password ||
                                !email ||
                                !password ||
                                loading
                            }>
                            Đăng nhập
                        </Button>
                    </div>
                    <div className={style.groupItem}>
                        <span className={style.dividerText}>
                            Bạn chưa có tài khoản?
                        </span>
                    </div>
                    <div className={style.groupItem}>
                        <Button light rounded_20 uppercase href={PATH.Register}>
                            Đăng ký
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default FormLogin;
