import { useId, useState } from 'react';
import clsx from 'clsx';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import styles from './Field.module.scss';

/** Ô nhập có nhãn, lỗi hiện ngay dưới ô; type="password" có nút hiện/ẩn. */
const Field = ({ label, error, hint, type = 'text', className, tone = 'dark', ...input }) => {
    const id = useId();
    const [reveal, setReveal] = useState(false);
    const isPassword = type === 'password';
    const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;

    return (
        <div className={clsx(styles.field, styles[tone], className)}>
            <label htmlFor={id}>{label}</label>
            <div className={styles.control}>
                <input
                    id={id}
                    type={isPassword && reveal ? 'text' : type}
                    aria-invalid={!!error}
                    aria-describedby={describedBy}
                    className={clsx(error && styles.invalid)}
                    {...input}
                />
                {isPassword && (
                    <button
                        type="button"
                        className={styles.reveal}
                        aria-label={reveal ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        aria-pressed={reveal}
                        onClick={() => setReveal((v) => !v)}
                    >
                        {reveal ? <AiOutlineEyeInvisible aria-hidden="true" /> : <AiOutlineEye aria-hidden="true" />}
                    </button>
                )}
            </div>
            {hint && !error && (
                <span id={`${id}-hint`} className={styles.hint}>
                    {hint}
                </span>
            )}
            {error && (
                <span id={`${id}-error`} className={styles.error}>
                    {error}
                </span>
            )}
        </div>
    );
};

export default Field;
