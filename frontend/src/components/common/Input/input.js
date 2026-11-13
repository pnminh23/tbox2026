import clsx from 'clsx';
import styles from './input.module.scss';
import { useStyleClass } from '@/hooks/useStyleClass';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { useState } from 'react';

const Input = ({ type = 'text', placeholder, value, onChange, icon, className, disabled, readOnly, ...props }) => {
    const styleClass = useStyleClass(props, styles);
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    const toggleShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className={clsx(styles.container, className, { [styles.disabled]: disabled })}>
            {icon && <div className={styles.icon}>{icon}</div>}

            <input
                type={inputType}
                className={clsx(styleClass, styles.input)}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                readOnly={readOnly}
                {...props}
            />

            {isPasswordType && !disabled && (
                <div className={styles.toggleIcon} onClick={toggleShowPassword} role="button" tabIndex={0}>
                    {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                </div>
            )}
        </div>
    );
};

export default Input;
