import styles from './PageIntro.module.scss';

/** Phần mở đầu trang: tiêu đề lớn + mô tả ngắn + nội dung phụ (bộ lọc, nút). */
const PageIntro = ({ title, lead, children }) => (
    <header className={styles.intro}>
        <h1>{title}</h1>
        {lead && <p>{lead}</p>}
        {children}
    </header>
);

export default PageIntro;
