import clsx from 'clsx';
import { upcomingDays } from '@/lib/booking.mjs';
import styles from './DayPicker.module.scss';

/** Dải chọn ngày (mặc định 7 ngày từ hôm nay). */
const DayPicker = ({ value, onChange, today, days = 7 }) => (
    <div role="group" aria-label="Chọn ngày" className={styles.days}>
        {upcomingDays(today, days).map(({ date, label, short }) => (
            <button
                key={date}
                type="button"
                aria-pressed={date === value}
                className={clsx(styles.day, date === value && styles.active)}
                onClick={() => onChange(date)}
            >
                {label}
                <span>{short}</span>
            </button>
        ))}
    </div>
);

export default DayPicker;
