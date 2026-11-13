import Button from "@/components/common/Button";
import styles from "./NewsManage.module.scss";
import Table from "@/components/common/Table";
import { AiOutlineDelete, AiOutlineEye, AiOutlinePlus } from "react-icons/ai";
import Tippy from "@tippyjs/react";
import Pagination from "@/components/common/Pagonation";
import {
    createNews,
    deleteNewsById,
    editNewsById,
    useAllNews,
    useNews,
} from "@/services/news";
import { useEffect, useState } from "react";
import Popup from "@/components/common/Popup/Popup";
import UploadFileImage from "@/components/common/UploadFileImage/UploadFileImage";
import Input from "@/components/common/Input";
import RichText from "@/components/common/RichText";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";

// Import tĩnh bị lỗi:
// import LoadingItem from '@/components/common/LoadingItem/LoadingItem';
// import LoadingFullPage from '@/components/common/LoadingFullPage/loadingFullPage';

// Thay thế bằng:
const DynamicLoadingItem = dynamic(
    () => import("@/components/common/LoadingItem/LoadingItem"),
    { ssr: false }
);

const DynamicLoadingFullPage = dynamic(
    () => import("@/components/common/LoadingFullPage/loadingFullPage"),
    {
        ssr: false, // Tùy chọn QUAN TRỌNG nhất
        loading: () => null, // Optional: có thể trả về null hoặc một div trống trong lúc chờ load
    }
);

const NewsManage = () => {
    const initialEditNews = {
        title: "",
        content: "",
        image: "",
    };
    const [isLoading, setIsLoading] = useState();
    const [editNews, setEditNews] = useState(initialEditNews);
    const [editFile, setEditFile] = useState(null);
    const [isPopupEdit, setIsPopupEdit] = useState(false);
    const [isPopupCreate, setIsPopupCreate] = useState(false);
    const [isPopupDelete, setIsPopupDelete] = useState(false);
    const [selectedNewsId, setSelectedNewsId] = useState(null);
    const { allNews, isLoading: loadingAllNews } = useAllNews();
    const { news } = useNews(selectedNewsId);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const totalItems = allNews?.length || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const paginatedNews =
        allNews?.slice((currentPage - 1) * limit, currentPage * limit) || [];
    const tableData =
        paginatedNews?.map((news, index) => ({
            _id: news._id, // để làm key cho row
            index: index + 1,
            title: news.title,
            image: news.image,
            createdAt: news.createdAt,
        })) || [];

    const resetEditNews = () => {
        setEditNews(initialEditNews);
        setEditFile(null);
    };
    useEffect(() => {
        // Chỉ cập nhật editNews nếu 'news' đã có và khớp với 'selectedNewsId'
        if (news && news._id === selectedNewsId) {
            // console.log("useEffect [news, selectedNewsId]: Populating editNews with content:", news.content);
            setEditNews({
                title: news.title || "",
                content: news.content || "", // Đây là nội dung từ API
                image: news.image || "",
            });
        }
        // Không cần reset editNews ở đây nếu selectedNewsId là null,
        // việc reset đã được xử lý khi đóng popup.
    }, [news, selectedNewsId]);

    const handleGetNews = async (_id) => {
        setSelectedNewsId(_id);
        setIsPopupEdit(true);
    };
    const handleContentChange = (newContentFromEditor) => {
        setEditNews((prevEditNews) => ({
            ...prevEditNews,
            content: newContentFromEditor,
        }));
        // console.log('RichText content updated in editNews.content:', newContentFromEditor);
    };

    const handleCreate = async () => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            if (editNews.title) formData.append("title", editNews.title);
            if (editNews.content) formData.append("content", editNews.content);

            if (editFile) formData.append("image", editFile);

            const response = await createNews(formData);
            console.log("response: ", response);
            if (response.success) {
                toast.success("Thêm tin mới thành công!");
                setIsPopupCreate(false);
                resetEditNews();
            } else {
                toast.error(response.message);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handelDeleteNews = async () => {
        try {
            setIsLoading(true);
            const response = await deleteNewsById(selectedNewsId);
            if (response.success) {
                toast.success("Xóa tin thành công!");
                setIsPopupDelete(false);
                setSelectedNewsId(null);
            } else {
                toast.error(response.message);
            }
        } catch (err) {
            toast.error("Đã xảy ra lỗi khi xóa!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async () => {
        try {
            setIsLoading(true); // bắt đầu loading
            const formData = new FormData();
            if (editNews.title) formData.append("title", editNews.title);
            if (editNews.content) formData.append("content", editNews.content);
            if (editFile) formData.append("image", editFile);

            const response = await editNewsById(selectedNewsId, formData);

            if (response.success) {
                toast.success("Cập nhật tin tức thành công!");
                setIsPopupEdit(false);
                resetEditNews();
                setSelectedNewsId(null);
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false); // kết thúc loading
        }
    };

    return (
        <div className={styles.container}>
            {isLoading && <DynamicLoadingFullPage />}
            {isPopupEdit && (
                <Popup
                    handleClose={() => {
                        setIsPopupEdit(false);
                        resetEditNews();
                        setSelectedNewsId(null);
                    }}>
                    <div className={styles.formPopup}>
                        <p className={styles.title}>Chi tiết tin tức</p>
                        <div className={styles.groupItem}>
                            <label>Ảnh:</label>
                            <UploadFileImage
                                newsImage
                                defaultImage={editNews.image}
                                onFileSelected={(file) => setEditFile(file)}
                            />
                            <div className={styles.groupItem}>
                                <label>Tiêu đề</label>
                                <Input
                                    rounded_10
                                    outLine
                                    value={editNews.title}
                                    onChange={(e) =>
                                        setEditNews((prev) => ({
                                            ...prev,
                                            title: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className={styles.groupItem}>
                                <label>Nội dung</label>
                                <RichText
                                    key={selectedNewsId || "new_news_editor"} // Quan trọng!
                                    initialContent={editNews.content}
                                    onChange={handleContentChange}
                                />
                            </div>
                        </div>
                        <Button
                            rounded_10
                            blue
                            w_fit
                            className={styles.btnAdd}
                            onClick={handleEdit}>
                            {isLoading ? "Đang cập nhật..." : "Cập nhật"}
                        </Button>
                    </div>
                </Popup>
            )}
            {isPopupCreate && (
                <Popup
                    handleClose={() => {
                        setIsPopupCreate(false);
                        resetEditNews();
                        setSelectedNewsId(null);
                    }}>
                    <div className={styles.formPopup}>
                        <p className={styles.title}>Thêm mới tin tức</p>
                        <div className={styles.groupItem}>
                            <label>Ảnh:</label>
                            <UploadFileImage
                                newsImage
                                defaultImage={editNews.image}
                                onFileSelected={(file) => setEditFile(file)}
                            />
                            <div className={styles.groupItem}>
                                <label>Tiêu đề</label>
                                <Input
                                    rounded_10
                                    outLine
                                    value={editNews.title}
                                    onChange={(e) =>
                                        setEditNews((prev) => ({
                                            ...prev,
                                            title: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className={styles.groupItem}>
                                <label>Nội dung</label>
                                <RichText
                                    key={selectedNewsId || "new_news_editor"} // Quan trọng!
                                    initialContent={editNews.content}
                                    onChange={handleContentChange}
                                />
                            </div>
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
            {isPopupDelete && (
                <Popup
                    handleClose={() => {
                        setIsPopupDelete(false);
                        setSelectedNewsId(null);
                    }}>
                    <div className={styles.formPopup}>
                        <p className={styles.title}>Xác nhận xóa</p>
                        <div className={styles.row}>
                            <div className={styles.groupItem}>
                                <label>{news?.title}</label>
                            </div>
                        </div>
                        <div className={styles.row}>
                            <Button
                                rounded_10
                                outline
                                light
                                onClick={() => {
                                    setIsPopupDelete(false);
                                    setSelectedNewsId(null);
                                }}>
                                Hủy
                            </Button>
                            <Button rounded_10 red onClick={handelDeleteNews}>
                                Xác nhận
                            </Button>
                        </div>
                    </div>
                </Popup>
            )}
            <div className={styles.discount}>
                <Button
                    rounded_10
                    w_fit
                    blue
                    icon={<AiOutlinePlus />}
                    className={styles.btnAdd}
                    onClick={() => {
                        resetEditNews();
                        setIsPopupCreate(true);
                    }}>
                    Thêm tin mới
                </Button>
            </div>
            <div className={styles.newsDiscount}>
                <Table
                    data={tableData}
                    columns={[
                        { key: "index", label: "STT" },
                        {
                            key: "title",
                            label: "Tiêu đề",
                            render: (item) => (
                                <div className={styles.titleContainer}>
                                    <p>{item.title}</p>
                                </div>
                            ),
                        },
                        { key: "image", label: "Ảnh" },
                        { key: "createdAt", label: "Ngày tạo" },
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
                                            handleGetNews(item._id)
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
                                            setSelectedNewsId(item._id);
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

export default NewsManage;
