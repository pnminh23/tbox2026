import clsx from 'clsx';
import { formatMoney } from '@/function/formatMoney';
import styles from './Checkout.module.scss';

/** Combo dạng radio; combo không hợp lệ vẫn hiện nhưng khóa kèm lý do. */
const ComboPicker = ({ options, value, onChange }) => (
    <fieldset className={styles.combos}>
        <legend className="sr-only">Thêm combo</legend>
        {[{ _id: '', name: 'Không thêm combo', reason: 'Gọi món tại phòng khi cần' }, ...options].map((o) => (
            <label
                key={o._id || 'none'}
                className={clsx(styles.combo, o.disabled && styles.disabled, value === o._id && styles.checked)}
            >
                <input
                    type="radio"
                    name="combo"
                    value={o._id}
                    checked={value === o._id}
                    disabled={o.disabled}
                    onChange={() => onChange(o._id)}
                />
                <span>
                    <strong>
                        {o.name}
                        {o.price != null && `, ${formatMoney(o.price)}`}
                    </strong>
                    {o.reason && <small>{o.reason}</small>}
                </span>
            </label>
        ))}
    </fieldset>
);

export default ComboPicker;
