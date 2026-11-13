import React from 'react';
import styles from './Pagination.module.scss';

function Pagination({ currentPage, totalPages, onPageChange, totalItems, onLimitChange, limit }) {
    const pageButtons = [];
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
            pageButtons.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`${styles.pageButton} ${currentPage === i ? styles.active : ''}`}
                >
                    {i}
                </button>
            );
        }
    } else {
        // Luôn hiển thị trang đầu
        pageButtons.push(
            <button
                key={1}
                onClick={() => onPageChange(1)}
                className={`${styles.pageButton} ${currentPage === 1 ? styles.active : ''}`}
            >
                1
            </button>
        );

        // Hiển thị ... nếu currentPage > 3
        if (currentPage > 3) {
            pageButtons.push(
                <span key="start-ellipsis" className={styles.ellipsis}>
                    ...
                </span>
            );
        }

        // Hiển thị các nút quanh currentPage
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) {
            pageButtons.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`${styles.pageButton} ${currentPage === i ? styles.active : ''}`}
                >
                    {i}
                </button>
            );
        }

        // Hiển thị ... nếu currentPage < totalPages - 2
        if (currentPage < totalPages - 2) {
            pageButtons.push(
                <span key="end-ellipsis" className={styles.ellipsis}>
                    ...
                </span>
            );
        }

        // Luôn hiển thị trang cuối
        pageButtons.push(
            <button
                key={totalPages}
                onClick={() => onPageChange(totalPages)}
                className={`${styles.pageButton} ${currentPage === totalPages ? styles.active : ''}`}
            >
                {totalPages}
            </button>
        );
    }

    return (
        <div className={styles.pagination}>
            <div className={styles.pageNumbers}>{pageButtons}</div>

            <div className={styles.limitContainer}>
                <div className={styles.limitSelect}>
                    <label htmlFor="limitSelect">Hiển thị mỗi trang: </label>
                    <select onChange={(e) => onLimitChange(Number(e.target.value))} value={limit}>
                        {![5, 8, 10, 20, 30].includes(limit) && <option value={limit}>{limit}</option>}
                        <option value={5}>5</option>
                        <option value={8}>8</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                    </select>
                </div>

                <div className={styles.totalItems}>trong tổng số {totalItems} kết quả</div>
            </div>
        </div>
    );
}

export default Pagination;
