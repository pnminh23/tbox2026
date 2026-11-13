import Image from 'next/image';
import styles from './NewsItem.module.scss';
import Link from 'next/link';
import noImage from '@public/static/img/avatar/no_image.jpg';

const NewsItem = ({ news }) => {
    if (!news) return null;
    const detailUrl = news._id ? `/news/${news._id}` : '#'; // Tạo URL động

    return (
        <div className={styles.container}>
            <div className={styles.img}>
                <Image src={news?.image || noImage} alt="News Image" fill objectFit="cover" sizes="100vw" />
            </div>
            <div className={styles.content}>
                <Link href={detailUrl} legacyBehavior={false}>
                    {' '}
                    {/* Bỏ legacyBehavior nếu không cần thiết cho style đặc biệt */}
                    <a className={styles.title}>{news.title}</a>
                </Link>
                <div className={styles.detail} dangerouslySetInnerHTML={{ __html: news?.content }} />
                <div className={styles.date}>
                    {new Date(news.createdAt).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </div>
            </div>
        </div>
    );
};

export default NewsItem;
