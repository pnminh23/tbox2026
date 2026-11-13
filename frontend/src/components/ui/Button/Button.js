import Link from 'next/link';
import clsx from 'clsx';
import styles from './Button.module.scss';

/**
 * Nút/link dùng chung. Có href → render Link; loading → khóa bấm + spinner.
 * variant: primary | outline | ghost; size: md | lg
 */
const Button = ({ variant = 'primary', size = 'md', block, loading, href, className, children, ...rest }) => {
    const cls = clsx(styles.btn, styles[variant], styles[size], block && styles.block, className);
    const content = (
        <>
            {loading && <span className={styles.spinner} aria-hidden="true" />}
            <span className={clsx(loading && styles.hidden)}>{children}</span>
        </>
    );

    if (href) {
        return (
            <Link href={href} className={cls} {...rest}>
                {content}
            </Link>
        );
    }
    return (
        <button
            type="button"
            className={cls}
            disabled={loading || rest.disabled}
            aria-busy={loading || undefined}
            {...rest}
        >
            {content}
        </button>
    );
};

export default Button;
