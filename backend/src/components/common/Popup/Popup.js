import { AiOutlineClose } from 'react-icons/ai';
import styles from './Popup.module.scss';
import { useStyleClass } from '@/hooks/useStyleClass';
import clsx from 'clsx';

const Popup = ({ children, handleClose, ...props }) => {
    const styleClass = useStyleClass(props, styles);
    return (
        <div className={styles.container}>
            <div className={clsx(styleClass, styles.popupContent)}>
                <AiOutlineClose onClick={handleClose} className={styles.iconClose} />
                {children}
            </div>
        </div>
    );
};

export default Popup;
