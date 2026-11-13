// components/NewsDetail.jsx (hoặc tên file của bạn)
import { useState, useEffect } from 'react'; // Thêm useState và useEffect
import styles from './NewsDetail.module.scss';
import Banner from '@/components/common/Banner';
import Title from '@/components/common/Title';
// News import from '@/pages/news/[_id]' is likely not needed here if this component is used on that page.
// If NewsDetail IS the page component for /news/[_id], then this import is circular.
// Assuming NewsDetail is a component used ON that page.
import { useAllNews } from '@/services/news';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/common/Button';
import noImage from '@public/static/img/avatar/no_image.jpg';

const ITEMS_PER_PAGE = 5; // Số lượng tin tức hiển thị mỗi lần "Xem thêm"

const NewsDetail = ({ news }) => {
    const { allNews, isLoading: loadingAllNews } = useAllNews();
    const [visibleNewsCount, setVisibleNewsCount] = useState(ITEMS_PER_PAGE);

    // Lọc ra các tin khác với tin hiện tại đang xem (nếu cần)
    // và chỉ lấy những tin có _id để tránh lỗi nếu dữ liệu chưa đầy đủ
    const otherNews = allNews?.filter((n) => n._id && n._id !== news?._id) || [];

    const handleLoadMore = () => {
        setVisibleNewsCount((prevCount) => Math.min(prevCount + ITEMS_PER_PAGE, otherNews.length));
    };

    // Reset visible count if the main news article changes or if allNews list changes
    useEffect(() => {
        setVisibleNewsCount(ITEMS_PER_PAGE);
    }, [news?._id, allNews]);

    const displayedSideNews = otherNews.slice(0, visibleNewsCount);
    const canLoadMore = visibleNewsCount < otherNews.length;

    return (
        <>
            <Banner />
            <div className="container">
                <div className={styles.NewsDetailWrapper}>
                    <div className={styles.contentContainer}>
                        <Title>{news?.title}</Title>
                        <div className={styles.imageWrapper}>
                            {news?.image && ( // Kiểm tra news?.image trước khi dùng
                                <Image
                                    src={news?.image || noImage}
                                    alt={news?.title || 'image'}
                                    fill
                                    sizes="100vw"
                                    priority
                                />
                            )}
                        </div>
                        <div className={styles.detail} dangerouslySetInnerHTML={{ __html: news?.content }} />
                        <div className={styles.date}>
                            {news?.createdAt &&
                                new Date(news.createdAt).toLocaleString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                        </div>
                    </div>

                    <div className={styles.navbar}>
                        <div className={styles.title}>
                            <p>TIN TỨC NỔI BẬT</p>
                        </div>
                        {loadingAllNews && <p>Đang tải tin tức...</p>}
                        {!loadingAllNews && displayedSideNews.length === 0 && <p>Không có tin nổi bật nào.</p>}
                        {displayedSideNews.map(
                            (
                                newsItem // đổi tên biến để không trùng với 'news' prop
                            ) => (
                                <div className={styles.newsItem} key={newsItem._id}>
                                    {' '}
                                    {/* Thêm key cho list item */}
                                    <div className={styles.imageItem}>
                                        {newsItem.image && ( // Kiểm tra image trước khi dùng
                                            <Image
                                                src={newsItem.image}
                                                alt={newsItem.title || 'image'}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        )}
                                    </div>
                                    <div className={styles.contentItem}>
                                        {/* Sử dụng Link component của Next.js cho internal navigation.
                                      Bỏ legacyBehavior nếu bạn không dùng thẻ <a> bên trong Link với mục đích style đặc biệt
                                      mà Link không tự xử lý được. Với Next.js 13+, thẻ <a> không còn cần thiết bên trong Link.
                                    */}
                                        <Link href={`/news/${newsItem._id}`} className={styles.link}>
                                            {newsItem.title}
                                        </Link>
                                        <div className={styles.date}>
                                            {newsItem.createdAt &&
                                                new Date(newsItem.createdAt).toLocaleString('vi-VN', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    // Bỏ giờ và phút cho danh sách rút gọn nếu muốn
                                                    // hour: '2-digit',
                                                    // minute: '2-digit',
                                                })}
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                        {/* Nút Xem thêm */}
                        {!loadingAllNews && canLoadMore && (
                            <Button
                                rounded_10
                                grey
                                onClick={handleLoadMore}
                                // Thêm class cho button để style
                            >
                                Xem thêm
                            </Button>
                        )}
                        {!loadingAllNews &&
                            !canLoadMore &&
                            displayedSideNews.length > 0 &&
                            displayedSideNews.length === otherNews.length && (
                                <Button
                                    disabled // Disable nút khi đã hết tin
                                >
                                    Đã hiển thị tất cả
                                </Button>
                            )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default NewsDetail;
