import Image from 'next/image';
import Link from 'next/link';
import { Button, Skeleton } from '@/components/ui';
import NewsItem from '@/components/common/NewsItem';
import { useAllNews } from '@/services/news';
import { PATH } from '@/constants/config';
import styles from './NewsDetail.module.scss';

/** Bài viết: nội dung HTML đã được backend lọc (sanitize) khi lưu. */
const NewsDetail = ({ news, isLoading }) => {
    const { allNews } = useAllNews();
    const others = allNews?.filter((n) => n._id !== news?._id).slice(0, 5) || [];

    if (isLoading) return <Skeleton h={480} radius={14} className={styles.loading} />;
    if (!news)
        return (
            <div className={styles.state}>
                <h1>Không tìm thấy bài viết</h1>
                <Button href={PATH.News}>Xem tin khác</Button>
            </div>
        );

    return (
        <div className={styles.page}>
            <article className={styles.article}>
                <Link href={PATH.News} className={styles.back}>
                    Tất cả tin tức
                </Link>
                <h1>{news.title}</h1>
                <time dateTime={news.createdAt} className={styles.date}>
                    {new Date(news.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                    })}
                </time>
                {news.image && (
                    <div className={styles.cover}>
                        <Image src={news.image} alt="" fill priority sizes="(max-width: 900px) 100vw, 760px" />
                    </div>
                )}
                <div className={styles.content} dangerouslySetInnerHTML={{ __html: news.content }} />
                <Button href={PATH.BookRoom} size="lg">
                    Đặt phòng ngay
                </Button>
            </article>
            {others.length > 0 && (
                <aside className={styles.aside} aria-labelledby="other-news">
                    <h2 id="other-news">Tin khác</h2>
                    {others.map((n) => (
                        <NewsItem key={n._id} news={n} compact />
                    ))}
                </aside>
            )}
        </div>
    );
};

export default NewsDetail;
