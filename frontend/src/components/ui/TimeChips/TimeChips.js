import clsx from 'clsx';
import styles from './TimeChips.module.scss';

/** Hàng nút lựa chọn; items: [{ value, label, ariaLabel? }] */
const TimeChips = ({ items, selected, onPick, label }) => (
    <div role="group" aria-label={label} className={styles.chips}>
        {items.map(({ value, label: text, ariaLabel }) => (
            <button
                key={value}
                type="button"
                aria-label={ariaLabel}
                aria-pressed={value === selected}
                className={clsx(styles.chip, value === selected && styles.active)}
                onClick={() => onPick(value)}
            >
                {text}
            </button>
        ))}
    </div>
);

export default TimeChips;
