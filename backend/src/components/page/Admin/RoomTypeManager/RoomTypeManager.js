import { useState } from "react";
import styles from "./RoomTypeManager.module.scss";
import {
    useAllTypeRooms,
    createRoomType,
    editRoomTypeById,
    deleteRoomTypeById,
} from "@/services/room";
import { toast } from "react-toastify";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import {
    AiOutlineCheck,
    AiOutlineClose,
    AiOutlineDelete,
    AiOutlineEdit,
    AiOutlinePlus,
} from "react-icons/ai";
import { formatMoney } from "@/function/formatMoney";
import Popup from "@/components/common/Popup/Popup";
import dynamic from "next/dynamic";

const DynamicLoadingFullPage = dynamic(
    () => import("@/components/common/LoadingFullPage/loadingFullPage"),
    {
        ssr: false, // Tùy chọn QUAN TRỌNG nhất
        loading: () => null, // Optional: có thể trả về null hoặc một div trống trong lúc chờ load
    }
);

const RoomTypeManager = () => {
    const { typeRooms, isLoading, isError, mutateTypeRooms } =
        useAllTypeRooms();
    const [isProcessing, setIsProcessing] = useState(false);

    const [newTypeName, setNewTypeName] = useState("");
    const [newTypePrice, setNewTypePrice] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editingData, setEditingData] = useState({ name: "", price: "" });

    const [isPopupDelete, setIsPopupDelete] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const handleCreate = async () => {
        if (!newTypeName || !newTypePrice) {
            return toast.warn("Vui lòng nhập đủ tên và giá.");
        }
        setIsProcessing(true);
        const result = await createRoomType({
            name: newTypeName,
            price: newTypePrice,
        });
        if (result.success) {
            toast.success("Thêm loại phòng thành công!");
            mutateTypeRooms();
            setNewTypeName("");
            setNewTypePrice("");
        } else {
            toast.error(result.message || "Thêm thất bại.");
        }
        setIsProcessing(false);
    };

    const handleStartEdit = (typeRoom) => {
        setEditingId(typeRoom._id);
        setEditingData({
            name: typeRoom.name,
            price: typeRoom.base_price_per_minute,
        });
    };

    const handleSaveEdit = async (id) => {
        setIsProcessing(true);
        const result = await editRoomTypeById(id, {
            name: editingData.name,
            price: editingData.price,
        });
        if (result.success) {
            toast.success("Cập nhật thành công!");
            mutateTypeRooms();
            setEditingId(null);
        } else {
            toast.error(result.message || "Cập nhật thất bại.");
        }
        setIsProcessing(false);
    };

    const handleOpenDeletePopup = (typeRoom) => {
        setItemToDelete(typeRoom);
        setIsPopupDelete(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        setIsProcessing(true);
        try {
            const result = await deleteRoomTypeById(itemToDelete._id);
            if (result.success) {
                toast.success("Xóa loại phòng thành công!");
                mutateTypeRooms();
            } else {
                toast.error(result.message || "Xóa thất bại.");
            }
        } catch (error) {
            toast.error(error.message || "Có lỗi xảy ra khi xóa.");
        } finally {
            setIsProcessing(false);
            setIsPopupDelete(false);
            setItemToDelete(null);
        }
    };

    if (isLoading) return <DynamicLoadingFullPage />;
    if (isError) return <p>Lỗi khi tải dữ liệu.</p>;

    return (
        <div className={styles.managerContainer}>
            {isProcessing && <DynamicLoadingFullPage />}

            {isPopupDelete && (
                <Popup handleClose={() => setIsPopupDelete(false)}>
                    <div className={styles.confirmPopup}>
                        <p className={styles.title}>Xác nhận xóa</p>
                        <p>
                            Bạn có chắc muốn xóa loại phòng:{" "}
                            <strong>{itemToDelete?.name}</strong>?
                        </p>
                        <p className={styles.warning}>
                            Hành động này không thể hoàn tác!
                        </p>
                        <div className={styles.popupActions}>
                            <Button
                                outline
                                light
                                rounded_10
                                onClick={() => setIsPopupDelete(false)}>
                                Hủy
                            </Button>
                            <Button
                                red
                                rounded_10
                                onClick={handleConfirmDelete}>
                                Xác nhận xóa
                            </Button>
                        </div>
                    </div>
                </Popup>
            )}

            <p className={styles.title}>Quản lý loại phòng</p>

            <ul className={styles.list}>
                {typeRooms?.map((type) => (
                    <li key={type._id} className={styles.item}>
                        {editingId === type._id ? (
                            <>
                                <Input
                                    outLine
                                    rounded_10
                                    value={editingData.name}
                                    onChange={(e) =>
                                        setEditingData({
                                            ...editingData,
                                            name: e.target.value,
                                        })
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleSaveEdit(type._id);
                                        }
                                    }}
                                />
                                <Input
                                    outLine
                                    rounded_10
                                    type="number"
                                    value={editingData.price}
                                    onChange={(e) =>
                                        setEditingData({
                                            ...editingData,
                                            price: e.target.value,
                                        })
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleSaveEdit(type._id);
                                        }
                                    }}
                                />
                                <div className={styles.actions}>
                                    <Button
                                        rounded_10
                                        blue
                                        icon={<AiOutlineCheck />}
                                        onClick={() => handleSaveEdit(type._id)}
                                    />
                                    <Button
                                        rounded_10
                                        grey
                                        small
                                        icon={<AiOutlineClose />}
                                        onClick={() => setEditingId(null)}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <span
                                    className={
                                        styles.itemName
                                    }>{`BOX - ${type.name}`}</span>
                                <span className={styles.itemPrice}>
                                    {formatMoney(type.base_price_per_minute)} /
                                    phút
                                </span>
                                <div className={styles.actions}>
                                    <Button
                                        rounded_10
                                        blueIcon
                                        small
                                        icon={<AiOutlineEdit />}
                                        onClick={() => handleStartEdit(type)}
                                    />
                                    <Button
                                        rounded_10
                                        redIcon
                                        small
                                        icon={<AiOutlineDelete />}
                                        onClick={() =>
                                            handleOpenDeletePopup(type)
                                        }
                                    />
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            <div className={styles.formCreate}>
                <p className={styles.title}>Thêm loại phòng mới</p>
                <div className={styles.inputs}>
                    <Input
                        outLine
                        rounded_10
                        placeholder="Tên loại phòng "
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                    />
                    <Input
                        outLine
                        rounded_10
                        type="number"
                        placeholder="Giá mỗi phút"
                        value={newTypePrice}
                        onChange={(e) => setNewTypePrice(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleCreate();
                            }
                        }}
                    />
                    <Button
                        rounded_10
                        blue
                        icon={<AiOutlinePlus />}
                        onClick={handleCreate}
                        disabled={isProcessing}>
                        Thêm
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RoomTypeManager;
