import Banner from '@/components/common/Banner';
import styles from './NewsPage.module.scss';
import NewsItem from '@/components/common/NewsItem';
import ReactPaginate from 'react-paginate';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import { useEffect, useRef, useState } from 'react';
import Title from '@/components/common/Title';
import { useAllNews } from '@/services/news';
import Pagination from '@/components/common/Pagonation';

const NewsPage = () => {
    const { allNews, isLoading: loadingAllNews } = useAllNews();
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(5);
    const totalItems = allNews?.length || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const paginatedNews = allNews?.slice((currentPage - 1) * limit, currentPage * limit) || [];

    return (
        <>
            <Banner />
            <div className="container">
                <Title>Khuyến mãi</Title>
                <div className={styles.content}>
                    <div className={styles.allFilm}>
                        {paginatedNews?.map((news) => (
                            <NewsItem key={news.id} news={news} />
                        ))}
                    </div>

                    <Pagination
                        // className={styles.pagination}
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
        </>
    );
};

export default NewsPage;
