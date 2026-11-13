import { useState } from 'react';
import { Button, PageIntro, Skeleton } from '@/components/ui';
import NewsItem from '@/components/common/NewsItem';
import { useAllNews } from '@/services/news';
import styles from './NewsPage.module.scss';

const PAGE = 9;

const NewsPage = () => {
    const { allNews, isLoading, error } = useAllNews();
    const [shown, setShown] = useState(PAGE);

    return (
        <>
            <PageIntro title="Tin tức và khuyến mãi" lead="Ưu đãi mới, combo theo mùa và tin từ các cơ sở PNM BOX." />
            <section className={styles.section} aria-busy={isLoading || undefined}>
                {error && <p role="alert">Chưa tải được tin tức, bạn thử tải lại trang nhé.</p>}
                <div className={styles.grid}>
                    {isLoading && Array.from({ length: 6 }, (_, i) => <Skeleton key={i} h={320} radius={14} />)}
                    {allNews?.slice(0, shown).map((news) => (
                        <NewsItem key={news._id} news={news} />
                    ))}
                </div>
                {allNews?.length === 0 && <p className={styles.muted}>Chưa có tin nào.</p>}
                {allNews?.length > shown && (
                    <div className={styles.more}>
                        <Button variant="outline" onClick={() => setShown((n) => n + PAGE)}>
                            Xem thêm tin
                        </Button>
                    </div>
                )}
            </section>
        </>
    );
};

export default NewsPage;
