import {
    createCombo,
    deleteComboById,
    editComboById,
    useAllCombo,
    useCombo,
} from "@/services/combo";
import styles from "./ComboManage.module.scss";
import { useEffect, useState } from "react";
import Tippy from "@tippyjs/react";
import Button from "@/components/common/Button";
import { AiOutlineDelete, AiOutlineEye, AiOutlinePlus } from "react-icons/ai";
import Pagination from "@/components/common/Pagonation";
import Table from "@/components/common/Table";
import Popup from "@/components/common/Popup/Popup";
import Input from "@/components/common/Input";
import clsx from "clsx";
import { toast } from "react-toastify";
import { useTypeRoom } from "@/services/room";
import dynamic from "next/dynamic";

const DynamicLoadingFullPage = dynamic(
    () => import("@/components/common/LoadingFullPage/loadingFullPage"),
    {
        ssr: false, // Tùy chọn QUAN TRỌNG nhất
        loading: () => null, // Optional: có thể trả về null hoặc một div trống trong lúc chờ load
    }
);

const ComboManage = () => {
    const { allCombo } = useAllCombo();
    const [selectedComboId, setSelectedComboId] = useState(null);
    const { combo } = useCombo(selectedComboId);
    const [currentPage, setCurrentPage] = useState(1); // bắt đầu từ 1
    const { typeRooms } = useTypeRoom();
    const [limit, setLimit] = useState(5); // mặc định 8 phim/trang
    const totalItems = allCombo?.length || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const paginatedBranches =
        allCombo?.slice((currentPage - 1) * limit, currentPage * limit) || [];
    const [isLoading, setIsLoading] = useState();
    const [isPopupEdit, setIsPopupEdit] = useState(false);
    const [isPopupCreate, setIsPopupCreate] = useState(false);
    const [isPopupDelete, setIsPopupDelete] = useState(false);
    const tableData =
        paginatedBranches?.map((combo, index) => ({
            _id: combo._id, // để làm key cho row
            index: index + 1,
            name: combo.name,
            types: combo.types,
            description: combo.description,
        })) || [];
    const [editCombo, setEditCombo] = useState({
        name: "",
        description: "",
        types: [],
        duration: 0, // Thêm duration vào state
    });

    useEffect(() => {
        if (combo) {
            setEditCombo({
                name: combo.name || "",
                description: combo.description || "",
                types: combo.types || [],
                duration: combo.duration || 0, // Cập nhật duration khi có dữ liệu combo
            });
        }
    }, [combo]);

    const handleGetCombo = async (_id) => {
        setSelectedComboId(_id);
        setIsPopupEdit(true);
    };
    const handleCreateCombo = async () => {
        try {
            setIsLoading(true);
            const newCombo = {
                name: editCombo.name,
                description: editCombo.description,
                types: editCombo.types,
                duration: editCombo.duration, // Thêm duration vào object tạo mới
            };

            const result = await createCombo(newCombo);
            if (result.success) {
                toast.success(result.message);
                setIsPopupCreate(false);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    const handleEditCombo = async () => {
        try {
            setIsLoading(true);
            const newCombo = {
                name: editCombo.name,
                description: editCombo.description,
                types: editCombo.types,
                duration: editCombo.duration, // Thêm duration vào object chỉnh sửa
            };
            const result = await editComboById(selectedComboId, newCombo);

            if (result.success) {
                toast.success(result.message);
                setEditCombo({
                    name: combo.name || "",
                    description: combo.description || "",
                    types: combo.types || [],
                    duration: combo.duration || 0, // Cập nhật lại state
                });
                setSelectedComboId(null);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCombo = async () => {
        try {
            setIsLoading(true);
            const result = await deleteComboById(selectedComboId);

            if (result.success) {
                toast.success(result.message);
                setSelectedComboId(null);
                setIsPopupDelete(false);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderRoomFormContent = (isEdit = false) => (
        <div className={styles.formPopup}>
            <p className={styles.title}>
                {isEdit ? "Chi tiết combo" : "Thêm combo mới"}
            </p>

            <div className={styles.groupItem}>
                <label>Tên combo</label>
                <Input
                    rounded_10
                    outLine
                    value={editCombo.name}
                    placeholder={"Nhập tên combo"}
                    onChange={(e) =>
                        setEditCombo((prev) => ({
                            ...prev,
                            name: e.target.value,
                        }))
                    }
                />
            </div>
            <div className={styles.groupItem}>
                <label>Thời lượng (phút)</label>
                <Input
                    rounded_10
                    outLine
                    value={editCombo.duration}
                    onChange={(e) =>
                        setEditCombo((prev) => ({
                            ...prev,
                            duration: Number(e.target.value),
                        }))
                    }
                />
            </div>
            <div className={clsx(styles.groupItem, styles.typeRoomContainer)}>
                <label>Giá combo theo loại phòng</label>
                {isEdit
                    ? editCombo.types.map((item, index) => (
                          <div className={styles.row} key={item._id}>
                              <div className={styles.typeRoom}>
                                  {item.typeRoom.name}
                              </div>
                              <Input
                                  outLine
                                  rounded_10
                                  value={item.price}
                                  className={styles.inputPrice}
                                  onChange={(e) => {
                                      const updatedTypes = [...editCombo.types];
                                      updatedTypes[index] = {
                                          ...updatedTypes[index],
                                          price: Number(e.target.value),
                                      };
                                      setEditCombo((prev) => ({
                                          ...prev,
                                          types: updatedTypes,
                                      }));
                                  }}
                              />
                          </div>
                      ))
                    : typeRooms?.map((item, index) => (
                          <div className={styles.row} key={item._id}>
                              <div className={styles.typeRoom}>{item.name}</div>
                              <Input
                                  outLine
                                  rounded_10
                                  value={editCombo.types?.[index]?.price || ""}
                                  className={styles.inputPrice}
                                  onChange={(e) => {
                                      const newPrice = Number(e.target.value);
                                      const updatedTypes = [
                                          ...(editCombo.types || []),
                                      ];

                                      updatedTypes[index] = {
                                          typeRoom: item._id,
                                          price: newPrice,
                                      };

                                      setEditCombo((prev) => ({
                                          ...prev,
                                          types: updatedTypes,
                                      }));
                                  }}
                              />
                          </div>
                      ))}
            </div>
            <div className={styles.groupItem}>
                <label>Mô tả</label>
                <textarea
                    rows={5}
                    className={styles.textareaDescription}
                    value={editCombo.description || ""}
                    placeholder="Nhập mô tả"
                    onChange={(e) =>
                        setEditCombo((prev) => ({
                            ...prev,
                            description: e.target.value,
                        }))
                    }
                />
            </div>

            <Button
                rounded_10
                blue
                w_fit
                className={styles.btnAdd}
                onClick={isEdit ? handleEditCombo : handleCreateCombo}>
                {isEdit ? "Cập nhật" : "Thêm mới"}
            </Button>
        </div>
    );
    return (
        <div className={styles.container}>
            {isLoading && <DynamicLoadingFullPage />}
            {isPopupEdit && (
                <Popup
                    key={selectedComboId || "create"}
                    handleClose={() => {
                        setIsPopupEdit(false);
                        setEditCombo({
                            name: "",
                            description: "",
                            types: [],
                            duration: 0, // Reset duration
                        });
                        setSelectedComboId(null);
                    }}>
                    {renderRoomFormContent(true)}
                </Popup>
            )}
            {isPopupCreate && (
                <Popup
                    handleClose={() => {
                        setIsPopupCreate(false);
                        setEditCombo({
                            name: "",
                            description: "",
                            types: [],
                            duration: 0, // Reset duration
                        });
                        setSelectedComboId(null);
                    }}>
                    {renderRoomFormContent(false)}
                </Popup>
            )}
            {isPopupDelete && (
                <Popup
                    handleClose={() => {
                        setIsPopupDelete(false);
                    }}>
                    <div className={styles.formPopup}>
                        <p className={styles.title}>Xác nhận xóa</p>
                        <div className={styles.row}>
                            <p>
                                Bạn muốn xóa
                                <b style={{ marginLeft: 6 }}>{combo?.name}</b>
                            </p>
                        </div>
                        <div className={styles.row}>
                            <Button
                                rounded_10
                                outline
                                light
                                onClick={() => setIsPopupDelete(false)}>
                                Hủy
                            </Button>
                            <Button rounded_10 red onClick={handleDeleteCombo}>
                                Xác nhận
                            </Button>
                        </div>
                    </div>
                </Popup>
            )}
            <div className={styles.header}>
                <Button
                    rounded_10
                    w_fit
                    blue
                    icon={<AiOutlinePlus />}
                    className={styles.btnAdd}
                    onClick={() => setIsPopupCreate(true)}>
                    Thêm mới Combo
                </Button>
            </div>
            <div className={styles.content}>
                <Table
                    data={tableData}
                    columns={[
                        { key: "index", label: "STT" },
                        {
                            key: "name",
                            label: "Tên cơ sở",
                            render: (item) => (
                                <div className={styles.nameComboContainer}>
                                    <p>{item.name}</p>
                                </div>
                            ),
                        },
                        { key: "description", label: "Mô tả" },
                    ]}
                    renderActions={(item) => (
                        <>
                            <Tippy content="Chi tiết" placement="bottom">
                                <div>
                                    <Button
                                        w_fit
                                        rounded_10
                                        p_10_14
                                        blueIcon
                                        icon={<AiOutlineEye />}
                                        onClick={() =>
                                            handleGetCombo(item._id)
                                        }></Button>
                                </div>
                            </Tippy>

                            <Tippy content="Xóa" placement="bottom">
                                <div>
                                    <Button
                                        w_fit
                                        rounded_10
                                        p_10_14
                                        redIcon
                                        icon={<AiOutlineDelete />}
                                        onClick={() => {
                                            setIsPopupDelete(true);
                                            setSelectedComboId(item._id);
                                        }}></Button>
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
                    onPageChange={(page) => setCurrentPage(page)}
                    onLimitChange={(newLimit) => {
                        setLimit(newLimit);
                        setCurrentPage(1); // reset về trang đầu
                    }}
                />
            </div>
        </div>
    );
};

export default ComboManage;
