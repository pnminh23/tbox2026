import { useEffect, useMemo, useState } from "react";
import styles from "./AccountManage.module.scss";
import { toast } from "react-toastify";
import clsx from "clsx";

// Services & Hooks
import {
    useAllAccounts,
    useAccountByEmail,
    toggleLock,
    editAccountByEmail,
    deleteAccountByEmail,
} from "@/services/account";

// Components
import Table from "@/components/common/Table";
import Pagination from "@/components/common/Pagonation";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Popup from "@/components/common/Popup/Popup";
import Tippy from "@tippyjs/react";
import Selection from "@/components/common/Selection";
import Calendar from "@/components/common/Calender";
import UploadFileImage from "@/components/common/UploadFileImage/UploadFileImage";
import {
    AiOutlineEdit,
    AiOutlineInteraction,
    AiOutlineLock,
    AiOutlineSearch,
    AiOutlineUnlock,
} from "react-icons/ai";
import dynamic from "next/dynamic";

const DynamicLoadingFullPage = dynamic(
    () => import("@/components/common/LoadingFullPage/loadingFullPage"),
    {
        ssr: false, // Tùy chọn QUAN TRỌNG nhất
        loading: () => null, // Optional: có thể trả về null hoặc một div trống trong lúc chờ load
    }
);

const AccountManage = () => {
    // === State Management ===
    const [searchInput, setSearchInput] = useState("");
    const [activeSearchQuery, setActiveSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [selectedEmail, setSelectedEmail] = useState(null); // Dùng để fetch data cho popup
    const [isProcessing, setIsProcessing] = useState(false);

    // State cho các popup
    const [isPopupEdit, setIsPopupEdit] = useState(false);
    const [isPopupDelete, setIsPopupDelete] = useState(false);

    // State cho form chỉnh sửa
    const initialEditState = {
        name: "",
        phone: "",
        email: "",
        role: "",
        image: "",
        isLock: false,
        createdAt: "",
    };
    const [editAccount, setEditAccount] = useState(initialEditState);
    const [editFile, setEditFile] = useState(null);
    const [newPassword, setNewPassword] = useState("");

    // === Data Fetching ===
    const { accounts, isLoading, isError, mutateAccounts } = useAllAccounts();
    const { account: selectedAccount } = useAccountByEmail(selectedEmail);

    // === Derived Data & Filtering ===
    const filteredAccounts = useMemo(() => {
        if (!accounts) return [];
        if (!activeSearchQuery) {
            return accounts;
        }
        const query = activeSearchQuery.toLowerCase();
        return accounts.filter(
            (acc) =>
                acc.name?.toLowerCase().includes(query) ||
                acc.phone?.toLowerCase().includes(query) ||
                acc.email?.toLowerCase().includes(query)
        );
    }, [accounts, activeSearchQuery]);

    const totalItems = filteredAccounts.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const paginatedAccounts = useMemo(() => {
        return filteredAccounts.slice(
            (currentPage - 1) * limit,
            currentPage * limit
        );
    }, [filteredAccounts, currentPage, limit]);

    const tableData = paginatedAccounts.map((acc, index) => ({
        id: acc._id,
        index: (currentPage - 1) * limit + index + 1,
        name: acc.name,
        phone: acc.phone,
        email: acc.email,
        role: acc.role,
        status: acc.isLock ? "Đã khóa" : "Hoạt động",
    }));

    // === Event Handlers & Effects ===
    useEffect(() => {
        if (selectedAccount) {
            setEditAccount({
                name: selectedAccount.name || "",
                phone: selectedAccount.phone || "",
                email: selectedAccount.email || "",
                image: selectedAccount.image || "",
                role: selectedAccount.role || "",
                isLock: selectedAccount.isLock || false,
                createdAt: selectedAccount.createdAt || "",
            });
        }
    }, [selectedAccount]);

    const handlePerformSearch = () => {
        setActiveSearchQuery(searchInput);
        setCurrentPage(1);
    };

    const handleGetAccount = (email) => {
        setSelectedEmail(email);
        setIsPopupEdit(true);
    };

    const handleOpenDeletePopup = (email) => {
        setSelectedEmail(email);
        setIsPopupDelete(true);
    };

    const handleToggleLock = async (email) => {
        const response = await toggleLock(email);
        if (response.success) {
            toast.success(response.message);
            mutateAccounts();
        } else {
            toast.error(response.message);
        }
    };

    const handleChangeRole = async (email, currentRole) => {
        const newRole = currentRole === "admin" ? "user" : "admin";
        const formData = new FormData();
        formData.append("role", newRole);
        const response = await editAccountByEmail(email, formData);
        if (response.success) {
            toast.success(`Đã đổi quyền của ${email} thành ${newRole}`);
            mutateAccounts();
        } else {
            toast.error(response.message);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append("name", editAccount.name);
            formData.append("phone", editAccount.phone);
            formData.append("role", editAccount.role);
            formData.append("isLock", editAccount.isLock);
            if (newPassword) formData.append("password", newPassword);
            if (editFile) formData.append("image", editFile);

            const response = await editAccountByEmail(
                editAccount.email,
                formData
            );

            if (response.success) {
                toast.success("Cập nhật tài khoản thành công!");
                mutateAccounts();
                setIsPopupEdit(false);
                setNewPassword("");
                setEditFile(null);
            } else {
                toast.error(response.message);
            }
        } catch (err) {
            toast.error("Đã xảy ra lỗi khi cập nhật!");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async () => {
        setIsProcessing(true);
        try {
            const response = await deleteAccountByEmail(selectedEmail);
            if (response.success) {
                toast.success(`Đã xóa tài khoản ${selectedEmail}`);
                mutateAccounts();
                setIsPopupDelete(false);
                setSelectedEmail(null);
            } else {
                toast.error(response.message);
            }
        } catch (err) {
            toast.error("Đã xảy ra lỗi khi xóa tài khoản!");
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) return <DynamicLoadingFullPage />;
    if (isError) return <div>Lỗi khi tải dữ liệu tài khoản.</div>;

    return (
        <div className={styles.container}>
            {isProcessing && <DynamicLoadingFullPage />}

            {/* Popup Chỉnh sửa */}
            {isPopupEdit && (
                <Popup handleClose={() => setIsPopupEdit(false)}>
                    <div className={styles.formEdit}>
                        <p className={styles.title}>Chỉnh sửa tài khoản</p>
                        <div className={styles.groupItem}>
                            <label>Ảnh đại diện</label>
                            <UploadFileImage
                                avatar
                                defaultImage={editAccount.image}
                                onFileSelected={(file) => {
                                    setEditFile(file);
                                    // Xử lý thêm nếu cần
                                }}
                            />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.groupItem}>
                                <label>Họ và tên:</label>
                                <Input
                                    rounded_10
                                    outLine
                                    value={editAccount.name}
                                    onChange={(e) =>
                                        setEditAccount((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className={styles.groupItem}>
                                <label>Số điện thoại:</label>
                                <Input
                                    rounded_10
                                    outLine
                                    value={editAccount.phone}
                                    onChange={(e) =>
                                        setEditAccount((prev) => ({
                                            ...prev,
                                            phone: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div
                                className={clsx(
                                    styles.groupItem,
                                    styles.inputEmail
                                )}>
                                <label>Email:</label>
                                <Input
                                    rounded_10
                                    value={editAccount.email}
                                    disabled></Input>
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div
                                className={clsx(styles.groupItem, styles.role)}>
                                <label>Quyền:</label>
                                <Selection
                                    options={["user", "admin"]}
                                    defaultValue={editAccount.role}
                                    rounded_10
                                    onChange={(value) =>
                                        setEditAccount((prev) => ({
                                            ...prev,
                                            role: value,
                                        }))
                                    }
                                />
                            </div>
                            <div
                                className={clsx(
                                    styles.groupItem,
                                    styles.status
                                )}>
                                <label>Trạng thái:</label>
                                <Selection
                                    options={["Hoạt Động", "Đã khóa"]}
                                    defaultValue={
                                        editAccount.isLock
                                            ? "Đã khóa"
                                            : "Hoạt Động"
                                    }
                                    onChange={(value) =>
                                        setEditAccount((prev) => ({
                                            ...prev,
                                            isLock: value === "Đã khóa",
                                        }))
                                    }
                                    rounded_10
                                />
                            </div>
                            <div
                                className={clsx(styles.groupItem, styles.date)}>
                                <label>Ngày tạo:</label>
                                <Calendar
                                    selectedDate={
                                        new Date(editAccount.createdAt)
                                    }
                                    disabled={true}
                                    rounded_10
                                />
                            </div>
                        </div>
                        <div className={styles.groupItem}>
                            <label>Thay đổi mật khẩu mới:</label>
                            <Input
                                rounded_10
                                outLine
                                placeholder={"Nhập mật khẩu mới"}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className={clsx(styles.row, styles.buttons)}>
                            <Button rounded_10 w_fit blue onClick={handleEdit}>
                                Cập nhật tài khoản
                            </Button>
                            <Button
                                rounded_10
                                w_fit
                                red
                                onClick={() => setIsPopupDelete(true)}>
                                Xóa tài khoản
                            </Button>
                        </div>
                    </div>
                </Popup>
            )}

            {/* Popup Xác nhận Xóa */}
            {isPopupDelete && (
                <Popup handleClose={() => setIsPopupDelete(false)}>
                    <div className={styles.formEdit}>
                        <p className={styles.title}>Xác nhận xóa</p>
                        <p>
                            Bạn có chắc muốn xóa tài khoản{" "}
                            <strong>{selectedEmail}</strong>? Hành động này
                            không thể hoàn tác.
                        </p>
                        <div className={clsx(styles.row, styles.buttons)}>
                            <Button
                                w_fit
                                outline
                                rounded_10
                                light
                                onClick={() => setIsPopupDelete(false)}>
                                Hủy
                            </Button>
                            <Button w_fit red rounded_10 onClick={handleDelete}>
                                Xác nhận
                            </Button>
                        </div>
                    </div>
                </Popup>
            )}

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.search}>
                    <Input
                        rounded_10
                        outLine
                        placeholder="Tìm kiếm theo tên, SĐT, email..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={(e) =>
                            e.key === "Enter" && handlePerformSearch()
                        }
                    />
                    <Button
                        w_fit
                        rounded_10
                        blue
                        icon={<AiOutlineSearch />}
                        onClick={handlePerformSearch}>
                        Tìm kiếm
                    </Button>
                </div>
            </div>

            {/* Bảng dữ liệu */}
            <div className={styles.content}>
                <Table
                    data={tableData}
                    columns={[
                        { key: "index", label: "STT" },
                        { key: "name", label: "Họ và tên" },
                        { key: "phone", label: "Số điện thoại" },
                        { key: "email", label: "Email" },
                        { key: "role", label: "Quyền" },
                        { key: "status", label: "Trạng thái" },
                    ]}
                    renderActions={(item) => (
                        <>
                            <Tippy content="Chỉnh sửa" placement="bottom">
                                <div>
                                    <Button
                                        rounded_10
                                        blueIcon
                                        icon={<AiOutlineEdit />}
                                        onClick={() =>
                                            handleGetAccount(item.email)
                                        }
                                    />
                                </div>
                            </Tippy>
                            <Tippy
                                content={
                                    item.status === "Đã khóa"
                                        ? "Mở khóa"
                                        : "Khóa"
                                }
                                placement="bottom">
                                <div>
                                    <Button
                                        rounded_10
                                        redIcon
                                        icon={
                                            item.status === "Đã khóa" ? (
                                                <AiOutlineUnlock />
                                            ) : (
                                                <AiOutlineLock />
                                            )
                                        }
                                        onClick={() =>
                                            handleToggleLock(item.email)
                                        }
                                    />
                                </div>
                            </Tippy>
                            <Tippy content="Thay đổi quyền" placement="bottom">
                                <div>
                                    <Button
                                        rounded_10
                                        greenIcon
                                        icon={<AiOutlineInteraction />}
                                        onClick={() =>
                                            handleChangeRole(
                                                item.email,
                                                item.role
                                            )
                                        }
                                    />
                                </div>
                            </Tippy>
                        </>
                    )}
                />
                <Pagination
                    className={styles.pagination}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    limit={limit}
                    onPageChange={setCurrentPage}
                    onLimitChange={(newLimit) => {
                        setLimit(newLimit);
                        setCurrentPage(1);
                    }}
                />
            </div>
        </div>
    );
};

export default AccountManage;
