import styles from './Skeleton.module.scss';

/** Khung chờ tải có ánh sáng quét ngang. */
const Skeleton = ({ w = '100%', h = 16, radius = 8, className }) => (
    <span
        className={`${styles.skeleton} ${className || ''}`}
        style={{ width: w, height: h, borderRadius: radius }}
        aria-hidden="true"
    />
);

export default Skeleton;
