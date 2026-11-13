import Button from '@/components/common/Button';
import styles from './PromotionManage.module.scss';
import Table from '@/components/common/Table';
import { AiOutlineDelete, AiOutlineEye, AiOutlinePlus, AiOutlineSearch } from 'react-icons/ai';
import Tippy from '@tippyjs/react';
import Pagination from '@/components/common/Pagonation';
import {
    createPromotion,
    deletePromotionById,
    editPromotionById,
    useAllPromotion,
    usePromotion,
} from '@/services/promotion';
import { useEffect, useMemo, useState } from 'react';
import Popup from '@/components/common/Popup/Popup';
import Input from '@/components/common/Input';
import { toast } from 'react-toastify';

const PromotionManage = () => {
    // === State Management ===
    const [searchInput, setSearchInput] = useState('');
    const [activeSearchQuery, setActiveSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const [selectedId, setSelectedId] = useState(null);
    const [isPopupEdit, setIsPopupEdit] = useState(false);
    const [isPopupCreate, setIsPopupCreate] = useState(false);
    const [isPopupDelete, setIsPopupDelete] = useState(false);
    const initialEditPromotion = { name: '', discountPercent: '', quantity: '' };
    const [editPromotion, setEditPromotion] = useState(initialEditPromotion);

    // === Data Fetching ===
    // Lấy hàm mutate để làm mới dữ liệu
    const { allPromotion, isLoading, mutate: mutatePromotions } = useAllPromotion();
    const { promotion: selectedPromotion } = usePromotion(selectedId);

    // === Derived Data & Filtering ===
    const filteredPromotions = useMemo(() => {
        if (!allPromotion) return [];
        if (!activeSearchQuery) {
            return allPromotion;
        }
        const query = activeSearchQuery.toLowerCase();
        return allPromotion.filter(
            (promo) =>
                promo.name?.toLowerCase().includes(query) ||
                promo.discountPercent?.toString().includes(query) ||
                promo.quantity?.toString().includes(query)
        );
    }, [allPromotion, activeSearchQuery]);

    const totalItems = filteredPromotions.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const paginatedPromotions = useMemo(() => {
        return filteredPromotions.slice((currentPage - 1) * limit, currentPage * limit);
    }, [filteredPromotions, currentPage, limit]);

    const tableData = paginatedPromotions.map((promo, index) => ({
        _id: promo._id,
        index: (currentPage - 1) * limit + index + 1,
        name: promo.name,
        discountPercent: promo.discountPercent,
        quantity: promo.quantity,
        createdAt: promo.createdAt,
    }));

    // === Event Handlers ===
    const resetEditPromotion = () => setEditPromotion(initialEditPromotion);

    useEffect(() => {
        if (selectedPromotion && selectedPromotion._id === selectedId) {
            setEditPromotion({
                name: selectedPromotion.name || '',
                discountPercent: selectedPromotion.discountPercent || '',
                quantity: selectedPromotion.quantity || '',
            });
        }
    }, [selectedPromotion, selectedId]);

    const handleGetDetail = (_id) => {
        setSelectedId(_id);
        setIsPopupEdit(true);
    };

    const handleOpenCreatePopup = () => {
        resetEditPromotion();
        setIsPopupCreate(true);
    };

    const handlePerformSearch = () => {
        setActiveSearchQuery(searchInput);
        setCurrentPage(1);
    };

    const handleCreate = async () => {
        const result = await createPromotion(editPromotion);
        if (result.success) {
            toast.success(result.message || 'Thêm khuyến mãi thành công!');
            mutatePromotions(); // Làm mới dữ liệu
            setIsPopupCreate(false);
            resetEditPromotion();
        } else {
            toast.error(result.message || 'Thêm khuyến mãi thất bại.');
        }
    };

    const handleEdit = async () => {
        const result = await editPromotionById(selectedId, editPromotion);
        if (result.success) {
            toast.success(result.message || 'Cập nhật thành công!');
            mutatePromotions(); // Làm mới dữ liệu
            setIsPopupEdit(false);
            resetEditPromotion();
            setSelectedId(null);
        } else {
            toast.error(result.message || 'Cập nhật thất bại.');
        }
    };

    const promotionToDelete = useMemo(() => {
        return allPromotion?.find((p) => p._id === selectedId);
    }, [allPromotion, selectedId]);

    const handleDelete = async () => {
        const response = await deletePromotionById(selectedId);
        if (response.success) {
            toast.success('Xóa khuyến mãi thành công!');
            mutatePromotions(); // Làm mới dữ liệu
            setIsPopupDelete(false);
            setSelectedId(null);
        } else {
            toast.error(response.message || 'Xóa thất bại.');
        }
    };

    return (
        <div className={styles.container}>
            {isPopupEdit && (
                <Popup
                    handleClose={() => {
                        setIsPopupEdit(false);
                        resetEditPromotion();
                        setSelectedId(null);
                    }}
                >
                    <div className={styles.formPopup}>
                        <p className={styles.title}>Chi tiết khuyến mãi</p>
                        <div className={styles.groupItem}>
                            <label>Mã khuyến mãi:</label>
                            <Input
                                rounded_10
                                outLine
                                value={editPromotion.name}
                                onChange={(e) => setEditPromotion((prev) => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className={styles.groupItem}>
                            <label>Phần trăm giảm giá</label>
                            <Input
                                rounded_10
                                outLine
                                type="number"
                                value={editPromotion.discountPercent}
                                onChange={(e) =>
                                    setEditPromotion((prev) => ({ ...prev, discountPercent: e.target.value }))
                                }
                            />
                        </div>
                        <div className={styles.groupItem}>
                            <label>Số lượng:</label>
                            <Input
                                rounded_10
                                outLine
                                type="number"
                                value={editPromotion.quantity}
                                onChange={(e) => setEditPromotion((prev) => ({ ...prev, quantity: e.target.value }))}
                            />
                        </div>
                        <Button rounded_10 w_fit blue onClick={handleEdit} className={styles.btnAdd}>
                            Cập nhật
                        </Button>
                    </div>
                </Popup>
            )}

            {isPopupCreate && (
                <Popup
                    handleClose={() => {
                        setIsPopupCreate(false);
                        resetEditPromotion();
                        setSelectedId(null);
                    }}
                >
                    <div className={styles.formPopup}>
                        <p className={styles.title}>Chi tiết khuyến mãi</p>
                        <div className={styles.groupItem}>
                            <label>Mã khuyến mãi:</label>
                            <Input
                                rounded_10
                                outLine
                                value={editPromotion.name}
                                onChange={(e) => setEditPromotion((prev) => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className={styles.groupItem}>
                            <label>Phần trăm giảm giá</label>
                            <Input
                                rounded_10
                                outLine
                                type="number"
                                value={editPromotion.discountPercent}
                                onChange={(e) =>
                                    setEditPromotion((prev) => ({ ...prev, discountPercent: e.target.value }))
                                }
                            />
                        </div>
                        <div className={styles.groupItem}>
                            <label>Số lượng:</label>
                            <Input
                                rounded_10
                                outLine
                                type="number"
                                value={editPromotion.quantity}
                                onChange={(e) => setEditPromotion((prev) => ({ ...prev, quantity: e.target.value }))}
                            />
                        </div>
                        <Button rounded_10 w_fit blue onClick={handleCreate} className={styles.btnAdd}>
                            Thêm mới
                        </Button>
                    </div>
                </Popup>
            )}

            {isPopupDelete && (
                <Popup handleClose={() => setIsPopupDelete(false)}>
                    <div className={styles.formPopup}>
                        <p className={styles.title}>Xác nhận xóa</p>
                        <p>
                            Bạn có chắc muốn xóa khuyến mãi: <strong>{promotionToDelete?.name}</strong>?
                        </p>
                        <div className={styles.row}>
                            <Button outline onClick={() => setIsPopupDelete(false)}>
                                Hủy
                            </Button>
                            <Button red onClick={handleDelete}>
                                Xác nhận
                            </Button>
                        </div>
                    </div>
                </Popup>
            )}

            <div className={styles.header}>
                <div className={styles.search}>
                    <Input
                        placeholder="Tìm theo mã khuyễn mãi, phần trăm giảm giá,số lượng" // Cập nhật placeholder
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        rounded_10
                        outLine
                        className={styles.searchInput}
                        onKeyPress={(event) => {
                            // Thêm tìm kiếm khi nhấn Enter
                            if (event.key === 'Enter') {
                                handlePerformSearch();
                            }
                        }}
                    />
                    <Button w_fit rounded_10 yellowLinear icon={<AiOutlineSearch />} onClick={handlePerformSearch}>
                        Tìm kiếm
                    </Button>
                </div>
                <Button
                    rounded_10
                    w_fit
                    blue
                    icon={<AiOutlinePlus />}
                    className={styles.btnAdd}
                    onClick={() => {
                        resetEditPromotion();
                        setIsPopupCreate(true);
                    }}
                >
                    Thêm khuyến mãi
                </Button>
            </div>

            <div className={styles.promotionTable}>
                <Table
                    data={tableData}
                    columns={[
                        { key: 'index', label: 'STT' },
                        { key: 'name', label: 'Mã KM' },

                        {
                            key: 'discountPercent',
                            label: 'Giảm giá',
                            render: (item) => <p>{`${item.discountPercent}%`}</p>,
                        },
                        { key: 'quantity', label: 'Số lượng' },
                        { key: 'createdAt', label: 'Ngày tạo' },
                    ]}
                    renderActions={(item) => (
                        <>
                            <Tippy content="Chi tiết" placement="bottom">
                                <div>
                                    <Button
                                        rounded_10
                                        blueIcon
                                        icon={<AiOutlineEye />}
                                        onClick={() => handleGetDetail(item._id)}
                                    />
                                </div>
                            </Tippy>
                            <Tippy content="Xóa" placement="bottom">
                                <div>
                                    <Button
                                        rounded_10
                                        redIcon
                                        icon={<AiOutlineDelete />}
                                        onClick={() => {
                                            setIsPopupDelete(true);
                                            setSelectedId(item._id);
                                        }}
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
                    onPageChange={(page) => setCurrentPage(page)}
                    onLimitChange={(newLimit) => {
                        setLimit(newLimit);
                        setCurrentPage(1);
                    }}
                />
            </div>
        </div>
    );
};

export default PromotionManage;
