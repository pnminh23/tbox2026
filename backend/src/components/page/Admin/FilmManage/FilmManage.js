import Table from "@/components/common/Table";
import styles from "./FilmManage.module.scss";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import {
    AiOutlineDelete,
    AiOutlineEdit,
    AiOutlineEye,
    AiOutlinePlus,
    AiOutlineSearch,
} from "react-icons/ai";
import {
    categoryFilms,
    createFilm,
    deleteFilmById,
    editFilmById,
    useAllFilms,
    useFilm,
} from "@/services/films";
import Popup from "@/components/common/Popup/Popup";
import { useEffect, useState, useMemo } from "react";
import Tippy from "@tippyjs/react";
import UploadFileImage from "@/components/common/UploadFileImage/UploadFileImage";
import Calendar from "@/components/common/Calender";
import Selection from "@/components/common/Selection";
import clsx from "clsx";
import { toast } from "react-toastify";
import Image from "next/image";
import Pagination from "@/components/common/Pagonation";
import dynamic from "next/dynamic";

const DynamicLoadingFullPage = dynamic(
    () => import("@/components/common/LoadingFullPage/loadingFullPage"),
    {
        ssr: false, // Tùy chọn QUAN TRỌNG nhất
        loading: () => null, // Optional: có thể trả về null hoặc một div trống trong lúc chờ load
    }
);
// import SearchBar from '@/components/common/SearchBar'; // SearchBar hiện tại của bạn (nếu vẫn dùng)

const FilmManage = () => {
    const { films, isLoadingFilms, isErrorFilms, mutateFilms } = useAllFilms();

    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(5);

    const [searchInput, setSearchInput] = useState("");
    const [activeSearchQuery, setActiveSearchQuery] = useState("");

    const [selectedFilmId, setSelectedFilmId] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState([]);
    const { film: selectedFilm } = useFilm(selectedFilmId); // Bỏ mutateFilm đã khai báo ở useAllFilms
    const [editFile, setEditFile] = useState(null);
    const [isPopupEdit, setIsPopupEdit] = useState(false);
    const [isPopupCreate, setIsPopupCreate] = useState(false);
    const [isPopupDelete, setIsPopupDelete] = useState(false);
    const [isLoadingAction, setIsLoadingAction] = useState(false);

    const initialEditFilm = {
        name: "",
        nameEnglish: "",
        category: [],
        duration: "",
        image: "",
        country: "",
        createdAt: "",
        release_date: "",
    };
    const [editFilm, setEditFilm] = useState(initialEditFilm);

    const resetEditFilm = () => {
        setEditFilm(initialEditFilm);
        setSelectedCategory([]);
        setEditFile(null);
    };

    useEffect(() => {
        if (selectedFilm) {
            setEditFilm({
                name: selectedFilm.name || "",
                nameEnglish: selectedFilm.nameEnglish || "",
                category: selectedFilm.category || [],
                duration: selectedFilm.duration || "",
                image: selectedFilm.image || "",
                country: selectedFilm.country || "",
                createdAt: selectedFilm.createdAt || "",
                release_date: selectedFilm.release_date || "",
            });
            setSelectedCategory(selectedFilm.category || []);
        }
    }, [selectedFilm]);

    // Lọc phim dựa trên activeSearchQuery - Đã cập nhật logic tìm kiếm
    const filteredFilms = useMemo(() => {
        if (!activeSearchQuery) {
            return films || [];
        }
        const query = activeSearchQuery.toLowerCase();
        return (films || []).filter((film) => {
            const nameMatch =
                film.name?.toLowerCase().includes(query) ||
                film.nameEnglish?.toLowerCase().includes(query);

            const releaseDateMatch = film.release_date
                ?.toString()
                .toLowerCase()
                .includes(query);

            const categoryMatch =
                Array.isArray(film.category) &&
                film.category.some((cat) => cat?.toLowerCase().includes(query));

            const countryMatch = film.country?.toLowerCase().includes(query);

            return (
                nameMatch || releaseDateMatch || categoryMatch || countryMatch
            );
        });
    }, [films, activeSearchQuery]);

    const totalItems = filteredFilms.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;

    const paginatedFilms = useMemo(() => {
        return filteredFilms.slice(
            (currentPage - 1) * limit,
            currentPage * limit
        );
    }, [filteredFilms, currentPage, limit]);

    const tableData =
        paginatedFilms?.map((film, index) => ({
            _id: film._id,
            index: (currentPage - 1) * limit + index + 1,
            name: film.name,
            duration: film.duration,
            country: film.country,
            image: film.image,
            release_date: film.release_date, // Năm phát hành
            category: film.category, // Hiển thị thể loại
            createdAt: film.createdAt,
        })) || [];

    const handleGetFilm = async (_id) => {
        setSelectedFilmId(_id);
        setIsPopupEdit(true);
    };

    const handelDeleteFilm = async () => {
        try {
            const response = await deleteFilmById(selectedFilmId);
            if (response.success) {
                toast.success("Xóa phim thành công!");
                setIsPopupDelete(false);
                setSelectedFilmId(null);
                mutateFilms();
            } else {
                toast.error(response.message);
            }
        } catch (err) {
            console.error(err);
            toast.error("Đã xảy ra lỗi khi xóa!");
        }
    };

    const handlePerformSearch = () => {
        setActiveSearchQuery(searchInput);
        setCurrentPage(1);
    };

    const handleCreate = async () => {
        setIsLoadingAction(true);
        try {
            const formData = new FormData();
            if (editFilm.name) formData.append("name", editFilm.name);
            if (editFilm.nameEnglish)
                formData.append("nameEnglish", editFilm.nameEnglish);
            if (editFilm.duration)
                formData.append("duration", editFilm.duration);
            if (editFilm.release_date)
                formData.append("release_date", editFilm.release_date);
            if (editFilm.country) formData.append("country", editFilm.country);

            if (selectedCategory && Array.isArray(selectedCategory)) {
                selectedCategory.forEach((categoryValue) => {
                    // Đổi tên biến để tránh nhầm lẫn
                    formData.append("category", categoryValue);
                });
            }

            if (editFile) formData.append("image", editFile);

            const response = await createFilm(formData);

            if (response.success) {
                toast.success("Thêm phim mới thành công!");
                setIsPopupCreate(false);
                resetEditFilm();
                mutateFilms();
            } else {
                toast.error(response.message);
            }
        } catch (err) {
            console.error(err);
            toast.error("Đã xảy ra lỗi khi thêm mới!");
        } finally {
            setIsLoadingAction(false); // <-- TẮT LOADING
        }
    };

    const handleEdit = async () => {
        setIsLoadingAction(true);
        try {
            const formData = new FormData();
            if (editFilm.name) formData.append("name", editFilm.name);
            if (editFilm.nameEnglish)
                formData.append("nameEnglish", editFilm.nameEnglish);
            if (editFilm.duration)
                formData.append("duration", editFilm.duration);
            if (editFilm.release_date)
                formData.append("release_date", editFilm.release_date);
            if (editFilm.country) formData.append("country", editFilm.country);

            if (selectedCategory && Array.isArray(selectedCategory)) {
                selectedCategory.forEach((categoryValue) => {
                    formData.append("category", categoryValue);
                });
            } else if (editFilm.category && Array.isArray(editFilm.category)) {
                editFilm.category.forEach((categoryValue) => {
                    formData.append("category", categoryValue);
                });
            }

            if (editFile) formData.append("image", editFile);

            const response = await editFilmById(selectedFilmId, formData);

            if (response.success) {
                toast.success("Cập nhật phim thành công!");
                setIsPopupEdit(false);
                resetEditFilm();
                setSelectedFilmId(null);
                mutateFilms();
            } else {
                toast.error(response.message);
            }
        } catch (err) {
            console.error(err);
            toast.error("Đã xảy ra lỗi khi cập nhật!");
        } finally {
            setIsLoadingAction(false); // <-- TẮT LOADING
        }
    };

    const handleOpenCreatePopup = () => {
        resetEditFilm();
        setIsPopupCreate(true);
    };

    return (
        <div className={styles.container}>
            {isLoadingAction && <DynamicLoadingFullPage />}
            {isPopupEdit && (
                <Popup
                    handleClose={() => {
                        setIsPopupEdit(false);
                        resetEditFilm();
                        setSelectedFilmId(null);
                    }}>
                    <div className={styles.formPopup}>
                        <p className={styles.title}>Chi tiết phim</p>
                        <div className={styles.groupItem}>
                            <label>Ảnh:</label>
                            <UploadFileImage
                                filmImage
                                defaultImage={editFilm.image}
                                onFileSelected={(file) => setEditFile(file)}
                            />
                        </div>
                        <div className={styles.groupItem}>
                            <label>Tên phim</label>
                            <Input
                                rounded_10
                                outLine
                                value={editFilm.name}
                                onChange={(e) =>
                                    setEditFilm((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className={styles.groupItem}>
                            <label>Tên tiếng anh:</label>
                            <Input
                                rounded_10
                                outLine
                                value={editFilm.nameEnglish}
                                onChange={(e) =>
                                    setEditFilm((prev) => ({
                                        ...prev,
                                        nameEnglish: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.groupItem}>
                                <label>Thời lượng:</label>
                                <Input
                                    rounded_10
                                    outLine
                                    value={editFilm.duration}
                                    onChange={(e) =>
                                        setEditFilm((prev) => ({
                                            ...prev,
                                            duration: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className={styles.groupItem}>
                                <label>Năm phát hành:</label>
                                <Input
                                    rounded_10
                                    outLine
                                    value={editFilm.release_date}
                                    onChange={(e) =>
                                        setEditFilm((prev) => ({
                                            ...prev,
                                            release_date: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        <div className={clsx(styles.groupItem)}>
                            <label>Thể loại:</label>
                            <Selection
                                options={categoryFilms}
                                defaultValue={selectedCategory} // Bind với selectedCategory được set từ useEffect
                                rounded_10
                                multiple
                                onChange={(selected) => {
                                    setSelectedCategory(selected);
                                }}></Selection>
                        </div>
                        <div className={styles.row}>
                            <div
                                className={clsx(styles.groupItem, styles.date)}>
                                <label>Ngày tạo:</label>
                                <Calendar
                                    selectedDate={
                                        editFilm.createdAt
                                            ? new Date(editFilm.createdAt)
                                            : null
                                    }
                                    disabled={true}
                                    rounded_10
                                />
                            </div>
                            <div
                                className={clsx(
                                    styles.groupItem,
                                    styles.country
                                )}>
                                <label>Quốc gia:</label>
                                <Input
                                    rounded_10
                                    outLine
                                    value={editFilm.country}
                                    onChange={(e) =>
                                        setEditFilm((prev) => ({
                                            ...prev,
                                            country: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        <Button
                            rounded_10
                            blue
                            w_fit
                            className={styles.btnAdd}
                            onClick={handleEdit}>
                            Cập nhật
                        </Button>
                    </div>
                </Popup>
            )}

            {/* Popup Tạo Phim Mới */}
            {isPopupCreate && (
                <Popup
                    handleClose={() => {
                        setIsPopupCreate(false);
                        resetEditFilm();
                    }}>
                    <div className={styles.formPopup}>
                        <p className={styles.title}>Thêm phim mới</p>
                        <div className={styles.groupItem}>
                            <label>Ảnh:</label>
                            <UploadFileImage
                                filmImage
                                defaultImage={editFilm.image || ""}
                                onFileSelected={(file) => setEditFile(file)}
                            />
                        </div>
                        <div className={styles.groupItem}>
                            <label>Tên phim</label>
                            <Input
                                rounded_10
                                outLine
                                value={editFilm.name}
                                onChange={(e) =>
                                    setEditFilm((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className={styles.groupItem}>
                            <label>Tên tiếng anh:</label>
                            <Input
                                rounded_10
                                outLine
                                value={editFilm.nameEnglish}
                                onChange={(e) =>
                                    setEditFilm((prev) => ({
                                        ...prev,
                                        nameEnglish: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className={styles.row}>
                            <div className={styles.groupItem}>
                                <label>Thời lượng:</label>
                                <Input
                                    rounded_10
                                    outLine
                                    value={editFilm.duration}
                                    onChange={(e) =>
                                        setEditFilm((prev) => ({
                                            ...prev,
                                            duration: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className={styles.groupItem}>
                                <label>Năm phát hành:</label>
                                <Input
                                    rounded_10
                                    outLine
                                    value={editFilm.release_date}
                                    onChange={(e) =>
                                        setEditFilm((prev) => ({
                                            ...prev,
                                            release_date: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        <div
                            className={clsx(styles.groupItem, styles.category)}>
                            <label>Thể loại:</label>
                            <Selection
                                options={categoryFilms}
                                defaultValue={editFilm.category}
                                rounded_10
                                multiple
                                onChange={(selected) => {
                                    setSelectedCategory(selected);
                                }}></Selection>
                        </div>
                        <div className={styles.groupItem}>
                            <label>Quốc gia:</label>
                            <Input
                                rounded_10
                                outLine
                                value={editFilm.country}
                                onChange={(e) =>
                                    setEditFilm((prev) => ({
                                        ...prev,
                                        country: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <Button
                            rounded_10
                            blue
                            w_fit
                            className={styles.btnAdd}
                            onClick={handleCreate}>
                            Thêm mới
                        </Button>
                    </div>
                </Popup>
            )}

            {/* Popup Xác Nhận Xóa */}
            {isPopupDelete && (
                <Popup
                    handleClose={() => {
                        setIsPopupDelete(false);
                        setSelectedFilmId(null);
                    }}>
                    <div className={styles.formPopup}>
                        <p className={styles.title}>Xác nhận xóa</p>
                        <div className={styles.row}>
                            <Image
                                src={
                                    selectedFilm?.image ||
                                    "/path/to/default/image_placeholder.png"
                                }
                                width={50}
                                height={70}
                                alt={
                                    selectedFilm?.nameEnglish || "Không có ảnh"
                                }
                            />
                            <div className={styles.groupItem}>
                                <label>{selectedFilm?.name}</label>
                                <p>{selectedFilm?.nameEnglish}</p>
                            </div>
                        </div>
                        <div className={styles.row}>
                            <Button
                                rounded_10
                                outline
                                light
                                onClick={() => {
                                    setIsPopupDelete(false);
                                    setSelectedFilmId(null);
                                }}>
                                Hủy
                            </Button>
                            <Button rounded_10 red onClick={handelDeleteFilm}>
                                Xác nhận
                            </Button>
                        </div>
                    </div>
                </Popup>
            )}

            <div className={styles.header}>
                <div className={styles.search}>
                    <Input
                        placeholder="Tìm theo tên, năm, thể loại, quốc gia..." // Cập nhật placeholder
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        rounded_10
                        outLine
                        className={styles.searchInput}
                        onKeyPress={(event) => {
                            // Thêm tìm kiếm khi nhấn Enter
                            if (event.key === "Enter") {
                                handlePerformSearch();
                            }
                        }}
                    />
                    <Button
                        w_fit
                        rounded_10
                        yellowLinear
                        icon={<AiOutlineSearch />}
                        onClick={handlePerformSearch}>
                        Tìm kiếm
                    </Button>
                </div>
                <Button
                    w_fit
                    rounded_10
                    blue
                    icon={<AiOutlinePlus />}
                    onClick={handleOpenCreatePopup}>
                    Thêm phim mới
                </Button>
            </div>

            <div className={styles.content}>
                {isLoadingFilms ? (
                    <p>Đang tải dữ liệu...</p>
                ) : isErrorFilms ? (
                    <p>Đã xảy ra lỗi khi tải dữ liệu!</p>
                ) : (
                    <>
                        <Table
                            data={tableData}
                            columns={[
                                { key: "index", label: "STT" },
                                { key: "name", label: "Tên phim" },
                                { key: "image", label: "Ảnh" },
                                { key: "duration", label: "Thời lượng" },
                                { key: "release_date", label: "Năm PH" }, // Sửa label
                                {
                                    key: "category",
                                    label: "Thể loại",
                                    render: (item) => (
                                        <div className={styles.category}>
                                            {Array.isArray(item.category) ? (
                                                item.category.map(
                                                    (cat, index) => (
                                                        <p
                                                            key={index}
                                                            className={
                                                                styles.categoryItem
                                                            }>
                                                            {cat}
                                                        </p>
                                                    )
                                                )
                                            ) : (
                                                <p
                                                    className={
                                                        styles.categoryItem
                                                    }>
                                                    N/A
                                                </p>
                                            )}
                                        </div>
                                    ),
                                }, // Thêm cột thể loại
                                { key: "country", label: "Quốc gia" },
                                { key: "createdAt", label: "Ngày đăng" },
                            ]}
                            renderActions={(item) => (
                                <>
                                    <Tippy
                                        content="Chỉnh sửa"
                                        placement="bottom">
                                        <div>
                                            <Button
                                                w_fit
                                                rounded_10
                                                p_10_14
                                                blueIcon
                                                icon={<AiOutlineEye />}
                                                onClick={() =>
                                                    handleGetFilm(item._id)
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
                                                    setSelectedFilmId(item._id);
                                                    setIsPopupDelete(true);
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
                                setCurrentPage(1);
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default FilmManage;
