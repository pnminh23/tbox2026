import Link from 'next/link';
import clsx from 'clsx';
import styles from './Button.module.scss';
import { useStyleClass } from '@/hooks/useStyleClass';

const Button = ({ children, onClick, icon, href, className, target, disabled, type, ...props }) => {
    const styleClass = useStyleClass(props, styles);

    let Wrapper = 'button';
    if (href) Wrapper = Link;

    const handleClick = (e) => {
        if (disabled) {
            e.preventDefault();
            return;
        }
        if (onClick) onClick(e);
    };

    return (
        <Wrapper
            className={clsx(
                styles.container,
                {
                    [styles.maxContent]: props.maxContent,
                    [styles.w_fit]: props.w_fit,
                    [styles.maxHeight]: props.maxHeight,
                    [styles.disabled]: disabled,
                    [styles.h30]: props.h30,
                },
                className
            )}
            {...(Wrapper === Link ? { href } : { type: type || 'submit' })}
            onClick={handleClick}
            disabled={disabled && Wrapper === 'button'}
        >
            <div className={clsx(styleClass, styles.btn)}>
                {icon && <div className={styles.icon}>{icon}</div>}
                <div className={clsx(styles.text, { [styles.noText]: !children })}>{children}</div>
            </div>
        </Wrapper>
    );
};

export default Button;
