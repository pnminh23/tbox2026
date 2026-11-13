import Image from 'next/image';
import Link from 'next/link';
import noImage from '@public/static/img/avatar/no_image.jpg';
import styles from './NewsItem.module.scss';

const DATE = { day: '2-digit', month: '2-digit', year: 'numeric' };

// Đoạn trích thuần chữ từ nội dung HTML
export const excerpt = (html = '', length = 140) => {
    const text = html
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
};

/** Thẻ tin tức: ảnh, ngày, tiêu đề (link), đoạn trích. */
const NewsItem = ({ news, compact = false }) => (
    <article className={compact ? `${styles.card} ${styles.compact}` : styles.card}>
        <div className={styles.img}>
            <Image
                src={news.image || noImage}
                alt=""
                fill
                sizes={compact ? '120px' : '(max-width: 768px) 100vw, 33vw'}
            />
        </div>
        <div className={styles.content}>
            <time dateTime={news.createdAt} className={styles.date}>
                {new Date(news.createdAt).toLocaleDateString('vi-VN', DATE)}
            </time>
            <h3>
                <Link href={`/news/${news._id}`} className={styles.title}>
                    {news.title}
                </Link>
            </h3>
            {!compact && <p className={styles.excerpt}>{excerpt(news.content)}</p>}
        </div>
    </article>
);

export default NewsItem;
