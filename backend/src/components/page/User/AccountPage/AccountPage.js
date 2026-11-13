import { useEffect, useState } from "react";
import style from "./AccountPage.module.scss";
import { toast } from "react-toastify";

// Services & Hooks
import { editAccountByEmail, useAccountByEmail } from "@/services/account";

// Components
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import UploadFileImage from "@/components/common/UploadFileImage/UploadFileImage";
import Link from "next/link";
import { PATH } from "@/constants/config";
import dynamic from "next/dynamic";

const DynamicLoadingFullPage = dynamic(
    () => import("@/components/common/LoadingFullPage/loadingFullPage"),
    {
        ssr: false, // Tùy chọn QUAN TRỌNG nhất
        loading: () => null, // Optional: có thể trả về null hoặc một div trống trong lúc chờ load
    }
);

const AccountPage = () => {
    // === State Management ===
    const [email, setEmail] = useState(null); // Bắt đầu với null
    const [editFile, setEditFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editAccount, setEditAccount] = useState({
        name: "",
        phone: "",
        email: "",
        image: "",
    });

    // 1. LẤY EMAIL TỪ LOCALSTORAGE KHI COMPONENT MOUNT
    useEffect(() => {
        const storedEmail = localStorage.getItem("email");
        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, []);

    // 2. GỌI HOOK SWR ĐỂ LẤY DỮ LIỆU TÀI KHOẢN
    // Hook sẽ tự động chạy khi `email` có giá trị
    const { account, isLoading, isError } = useAccountByEmail(email);

    // 3. useEffect NÀY SẼ TỰ ĐỘNG ĐIỀN FORM KHI CÓ DỮ LIỆU TỪ HOOK
    useEffect(() => {
        if (account) {
            setEditAccount({
                name: account.name || "",
                phone: account.phone || "",
                email: account.email || "",
                image: account.image || "",
            });
        }
    }, [account]);

    // 4. HÀM XỬ LÝ CẬP NHẬT
    const handleEdit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", editAccount.name);
            formData.append("phone", editAccount.phone);
            if (editFile) {
                formData.append("image", editFile);
            }

            const response = await editAccountByEmail(email, formData);

            if (response.success) {
                toast.success("Cập nhật tài khoản thành công!");
                setEditFile(null); // Reset file đã chọn
            } else {
                toast.error(response.message || "Cập nhật thất bại.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Đã xảy ra lỗi khi cập nhật!");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 5. XỬ LÝ TRẠNG THÁI LOADING VÀ ERROR
    if (isLoading) {
        return <DynamicLoadingFullPage />;
    }
    if (isError) {
        return <div>Lỗi khi tải thông tin tài khoản. Vui lòng thử lại.</div>;
    }

    return (
        <form className={style.container} onSubmit={handleEdit}>
            <div className={style.groupItem}>
                <p className={style.label}>Thông tin tài khoản</p>
                <UploadFileImage
                    avatar
                    defaultImage={editAccount.image}
                    onFileSelected={(file) => setEditFile(file)}
                />
                <div className={style.groupItem}>
                    <p className={style.label}>Họ và tên</p>
                    <Input
                        rounded_10
                        value={editAccount.name}
                        onChange={(e) =>
                            setEditAccount((prev) => ({
                                ...prev,
                                name: e.target.value,
                            }))
                        }
                        required
                    />
                </div>
                <div className={style.row}>
                    <div className={style.groupItem}>
                        <p className={style.label}>Email</p>
                        <Input rounded_10 disabled value={editAccount.email} />
                    </div>
                    <div className={style.groupItem}>
                        <p className={style.label}>Số điện thoại</p>
                        <Input
                            rounded_10
                            value={editAccount.phone}
                            onChange={(e) =>
                                setEditAccount((prev) => ({
                                    ...prev,
                                    phone: e.target.value,
                                }))
                            }
                            required
                        />
                    </div>
                </div>

                <Link
                    href={PATH.ForgotPassword}
                    className={style.changePassword}>
                    Thay đổi mật khẩu
                </Link>

                <div className={style.groupItem}>
                    <Button
                        yellowLinear
                        type="submit"
                        rounded_10
                        w_fit
                        disabled={isSubmitting}>
                        {isSubmitting
                            ? "Đang cập nhật..."
                            : "Cập nhật thông tin"}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default AccountPage;
