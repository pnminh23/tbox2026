import { useEffect, useMemo, useState } from "react";
import styles from "./LocationManage.module.scss";
import { toast } from "react-toastify";

// Services & Hooks
import {
    createBranch,
    deleteBranchById,
    editBranchById,
    useAllBranches,
    useBranch,
} from "@/services/branch";
import { useTypeRoom } from "@/services/room";

// Components
import Table from "@/components/common/Table";
import Pagination from "@/components/common/Pagonation";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Popup from "@/components/common/Popup/Popup";
import Tippy from "@tippyjs/react";
import {
    AiOutlineDelete,
    AiOutlineEye,
    AiOutlinePlus,
    AiOutlineSearch,
} from "react-icons/ai";
import RoomList from "@/components/page/Admin/RoomList/RoomList";
import Tabs from "@/components/common/Tabs/Tabs";
import dynamic from "next/dynamic";

const DynamicLoadingFullPage = dynamic(
    () => import("@/components/common/LoadingFullPage/loadingFullPage"),
    {
        ssr: false, // Tùy chọn QUAN TRỌNG nhất
        loading: () => null, // Optional: có thể trả về null hoặc một div trống trong lúc chờ load
    }
);
import RoomTypeManager from "../RoomTypeManager/RoomTypeManager";

const LocationManage = () => {
    // === State Management ===
    const [searchInput, setSearchInput] = useState("");
    const [activeSearchQuery, setActiveSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [selectedBranchId, setSelectedBranchId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRoomTypePopupVisible, setIsRoomTypePopupVisible] = useState(false);

    // State cho các popup
    const [isPopupEdit, setIsPopupEdit] = useState(false);
    const [isPopupCreate, setIsPopupCreate] = useState(false);
    const [isPopupDelete, setIsPopupDelete] = useState(false);

    // State cho form
    const initialEditBranch = { name: "", address: "", phone: "" };
    const [editBranch, setEditBranch] = useState(initialEditBranch);

    // === Data Fetching ===
    const { branches, isLoading, isError, mutateBranches } = useAllBranches();
    const { branch: selectedBranch } = useBranch(selectedBranchId);
    const { typeRooms } = useTypeRoom();

    // === Derived Data & Filtering ===
    const filteredBranches = useMemo(() => {
        if (!branches) return [];
        if (!activeSearchQuery) {
            return branches;
        }
        const query = activeSearchQuery.toLowerCase();
        return branches.filter(
            (branch) =>
                branch.name?.toLowerCase().includes(query) ||
                branch.address?.toLowerCase().includes(query) ||
                branch.phone?.toLowerCase().includes(query)
        );
    }, [branches, activeSearchQuery]);

    const totalItems = filteredBranches.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const paginatedBranches = useMemo(() => {
        return filteredBranches.slice(
            (currentPage - 1) * limit,
            currentPage * limit
        );
    }, [filteredBranches, currentPage, limit]);

    const tableData = paginatedBranches.map((branch, index) => ({
        ...branch,
        index: index + 1,
    }));

    // === Event Handlers & Effects ===
    const resetForm = () => setEditBranch(initialEditBranch);

    useEffect(() => {
        if (selectedBranch) {
            setEditBranch({
                name: selectedBranch.name || "",
                address: selectedBranch.address || "",
                phone: selectedBranch.phone || "",
            });
        }
    }, [selectedBranch]);

    const handlePerformSearch = () => {
        setActiveSearchQuery(searchInput);
        setCurrentPage(1);
    };

    const handleGetBranch = (id) => {
        setSelectedBranchId(id);
        setIsPopupEdit(true);
    };

    const handleOpenCreatePopup = () => {
        resetForm();
        setIsPopupCreate(true);
    };

    const handleOpenDeletePopup = (id) => {
        setSelectedBranchId(id);
        setIsPopupDelete(true);
    };

    const handleCreateBranch = async () => {
        setIsProcessing(true);
        const result = await createBranch(editBranch);
        if (result.success) {
            toast.success("Thêm cơ sở mới thành công!");
            mutateBranches();
            setIsPopupCreate(false);
            resetForm();
        } else {
            toast.error(result.message || "Thêm mới thất bại.");
        }
        setIsProcessing(false);
    };

    const handleEditBranch = async () => {
        if (!selectedBranchId) return;
        setIsProcessing(true);
        const result = await editBranchById(selectedBranchId, editBranch);
        if (result.success) {
            toast.success("Cập nhật cơ sở thành công!");
            mutateBranches();
            setIsPopupEdit(false);
        } else {
            toast.error(result.message || "Cập nhật thất bại.");
        }
        setIsProcessing(false);
    };

    const handleDeleteBranch = async () => {
        if (!selectedBranchId) return;
        setIsProcessing(true);
        const result = await deleteBranchById(selectedBranchId);
        if (result.success) {
            toast.success(result.message);
            mutateBranches();
        } else {
            toast.error(result.message);
        }
        setIsProcessing(false);
        setIsPopupDelete(false);
        setSelectedBranchId(null);
    };

    // Hàm render form chung cho Cả Create và Edit
    const renderBranchForm = (isEdit = false) => (
        <div className={styles.formPopup}>
            <p className={styles.title}>
                {isEdit ? "Chi tiết & Chỉnh sửa cơ sở" : "Thêm cơ sở mới"}
            </p>
            <div className={styles.row}>
                <div className={styles.groupItem}>
                    <label>Tên cơ sở</label>
                    <Input
                        rounded_10
                        outLine
                        value={editBranch.name}
                        onChange={(e) =>
                            setEditBranch((prev) => ({
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
                        value={editBranch.phone}
                        onChange={(e) =>
                            setEditBranch((prev) => ({
                                ...prev,
                                phone: e.target.value,
                            }))
                        }
                    />
                </div>
            </div>
            <div className={styles.groupItem}>
                <label>Địa chỉ:</label>
                <Input
                    rounded_10
                    outLine
                    value={editBranch.address}
                    onChange={(e) =>
                        setEditBranch((prev) => ({
                            ...prev,
                            address: e.target.value,
                        }))
                    }
                />
            </div>

            {isEdit && selectedBranchId && (
                <div className={styles.groupItem}>
                    <label>Danh sách phòng</label>
                    <Tabs
                        tabs={typeRooms?.map((item) => ({
                            label: item.name,
                            content: (
                                <RoomList
                                    branchId={selectedBranchId}
                                    typeRoomId={item._id}
                                />
                            ),
                        }))}
                    />
                </div>
            )}

            <Button
                rounded_10
                blue
                w_fit
                className={styles.btnAdd}
                onClick={isEdit ? handleEditBranch : handleCreateBranch}>
                {isEdit ? "Cập nhật" : "Thêm mới"}
            </Button>
        </div>
    );

    if (isLoading) return <DynamicLoadingFullPage />;
    if (isError) return <div>Lỗi khi tải dữ liệu cơ sở.</div>;

    return (
        <div className={styles.container}>
            {isProcessing && <DynamicLoadingFullPage />}

            {isPopupEdit && (
                <Popup big handleClose={() => setIsPopupEdit(false)}>
                    {renderBranchForm(true)}
                </Popup>
            )}
            {isPopupCreate && (
                <Popup handleClose={() => setIsPopupCreate(false)}>
                    {renderBranchForm(false)}
                </Popup>
            )}
            {isPopupDelete && (
                <Popup handleClose={() => setIsPopupDelete(false)}>
                    <div className={styles.formPopup}>
                        <p className={styles.title}>Xác nhận xóa</p>
                        <p>
                            Bạn có chắc muốn xóa cơ sở{" "}
                            <strong>{selectedBranch?.name}</strong>? Toàn bộ
                            phòng và đơn đặt thuộc cơ sở này cũng sẽ bị ảnh
                            hưởng.
                        </p>
                        <div className={styles.confirmActions}>
                            <Button
                                outline
                                light
                                onClick={() => setIsPopupDelete(false)}>
                                Hủy
                            </Button>
                            <Button red onClick={handleDeleteBranch}>
                                Xác nhận
                            </Button>
                        </div>
                    </div>
                </Popup>
            )}
            {isRoomTypePopupVisible && (
                <Popup handleClose={() => setIsRoomTypePopupVisible(false)}>
                    <RoomTypeManager />
                </Popup>
            )}

            <div className={styles.header}>
                <div className={styles.search}>
                    <Input
                        rounded_10
                        outLine
                        placeholder="Tìm kiếm theo tên, địa chỉ, SĐT..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={(e) =>
                            e.key === "Enter" && handlePerformSearch()
                        }
                    />
                    <Button
                        w_fit
                        rounded_10
                        yellowLinear
                        icon={<AiOutlineSearch />}
                        onClick={handlePerformSearch}>
                        Tìm kiếm
                    </Button>
                    <Button
                        rounded_10
                        blue
                        onClick={() =>
                            setIsRoomTypePopupVisible((prev) => !prev)
                        }>
                        Tùy chỉnh loại phòng
                    </Button>
                </div>
                <Button
                    w_fit
                    rounded_10
                    blue
                    icon={<AiOutlinePlus />}
                    onClick={handleOpenCreatePopup}>
                    Thêm mới cơ sở
                </Button>
            </div>

            <div className={styles.content}>
                <Table
                    data={tableData}
                    columns={[
                        { key: "index", label: "STT" },
                        { key: "name", label: "Tên cơ sở" },
                        { key: "address", label: "Địa chỉ" },
                        { key: "phone", label: "Hotline" },
                    ]}
                    renderActions={(item) => (
                        <>
                            <Tippy
                                content="Chi tiết & Chỉnh sửa"
                                placement="bottom">
                                <div>
                                    <Button
                                        rounded_10
                                        w_fit
                                        blueIcon
                                        icon={<AiOutlineEye />}
                                        onClick={() =>
                                            handleGetBranch(item._id)
                                        }
                                    />
                                </div>
                            </Tippy>
                            <Tippy content="Xóa" placement="bottom">
                                <div>
                                    <Button
                                        rounded_10
                                        w_fit
                                        redIcon
                                        icon={<AiOutlineDelete />}
                                        onClick={() =>
                                            handleOpenDeletePopup(item._id)
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

export default LocationManage;
