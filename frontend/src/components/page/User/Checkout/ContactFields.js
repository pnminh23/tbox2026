import styles from './Checkout.module.scss';

const FIELDS = [
    { key: 'name', label: 'Họ và tên', type: 'text', autoComplete: 'name' },
    { key: 'phone', label: 'Số điện thoại', type: 'tel', autoComplete: 'tel', inputMode: 'numeric' },
    { key: 'email', label: 'Email nhận vé', type: 'email', autoComplete: 'email' },
];

/** Thông tin liên hệ; lỗi hiện dưới ô sau khi rời ô (touched). */
const ContactFields = ({ value, errors, touched, onChange, onBlur }) => (
    <div className={styles.contact}>
        {FIELDS.map(({ key, label, ...input }) => {
            const error = touched[key] && errors[key];
            return (
                <label key={key} className={styles.field}>
                    {label}
                    <input
                        {...input}
                        name={key}
                        value={value[key]}
                        onChange={(e) => onChange(key, e.target.value)}
                        onBlur={() => onBlur(key)}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${key}-error` : undefined}
                        className={error ? styles.invalid : undefined}
                        required
                    />
                    {error && (
                        <span id={`${key}-error`} className={styles.error}>
                            {error}
                        </span>
                    )}
                </label>
            );
        })}
    </div>
);

export default ContactFields;
