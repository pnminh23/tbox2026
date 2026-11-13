import React from 'react';
import styles from './Table.module.scss';
import clsx from 'clsx';
import Image from 'next/image';
import dayjs from 'dayjs';

const Table = ({ columns, data, renderActions }) => {
    return (
        <div className={styles.container}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} className={styles[`col-${column.key}`]}>
                                {column.label}
                            </th>
                        ))}
                        {/* Chỉ hiển thị cột Thao tác nếu có hàm renderActions */}
                        {renderActions && <th className={styles.colAction}>Thao tác</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={`${item._id}-${index}`}>
                            {columns.map((column) => (
                                <td key={column.key} className={styles[`col-${column.key}`]}>
                                    {column.key === 'role' ? (
                                        <span className={styles.role}>{item[column.key]}</span>
                                    ) : column.key === 'createdAt' ? ( // Gộp chung điều kiện cho ngày tháng
                                        <span className={clsx(styles.createdAt)}>
                                            {dayjs(item[column.key]).format('DD/MM/YYYY')}
                                        </span>
                                    ) : column.key === 'image' ? (
                                        <Image
                                            src={item[column.key] || '/default-image.png'} // Thêm ảnh dự phòng
                                            className={clsx(styles.image)}
                                            alt={item.name || 'image'}
                                            width={40}
                                            height={60}
                                        />
                                    ) : column.render ? (
                                        column.render(item)
                                    ) : (
                                        item[column.key]
                                    )}
                                </td>
                            ))}
                            {/* Chỉ render ô <td> cho actions nếu có hàm renderActions */}
                            {renderActions && (
                                <td>
                                    <div className={styles.actions}>{renderActions(item)}</div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
