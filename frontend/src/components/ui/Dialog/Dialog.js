import { useEffect, useId, useRef } from 'react';
import styles from './Dialog.module.scss';

/** Hộp thoại dùng <dialog> gốc: khóa focus bên trong, Esc / bấm nền để đóng. */
const Dialog = ({ open, onClose, title, children }) => {
    const ref = useRef(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = ref.current;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            className={styles.dialog}
            aria-labelledby={titleId}
            onClose={onClose}
            onClick={(e) => e.target === ref.current && onClose()}
        >
            <div className={styles.inner}>
                <div className={styles.head}>
                    <h2 id={titleId}>{title}</h2>
                    <button type="button" className={styles.close} aria-label="Đóng" onClick={onClose}>
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            aria-hidden="true"
                        >
                            <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>
                </div>
                {open && children}
            </div>
        </dialog>
    );
};

export default Dialog;
