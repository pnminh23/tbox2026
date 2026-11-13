import { useId } from 'react';
import styles from './StarRating.module.scss';

/** Chọn 1–5 sao bằng radio (dùng được với phím mũi tên). */
const StarRating = ({ value, onChange, label = 'Đánh giá' }) => {
    const name = useId();
    return (
        <fieldset className={styles.stars}>
            <legend>{label}</legend>
            <div className={styles.row}>
                {[1, 2, 3, 4, 5].map((n) => (
                    <label key={n} className={n <= value ? styles.on : undefined}>
                        <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} />
                        <span aria-hidden="true">★</span>
                        <span className="sr-only">{n} sao</span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
};

export default StarRating;
