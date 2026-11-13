import clsx from 'clsx';
import styles from './Ticket.module.scss';

/**
 * Chiếc vé 2 phần nối bằng đường đứt nét, lỗ bấm khoét bằng CSS mask (thấy được nền phía sau).
 * horizontal: main | stub (trái → phải); vertical: main / stub (trên → dưới)
 */
const Ticket = ({
    direction = 'horizontal',
    main,
    stub,
    tone = 'cream',
    stubTone = tone,
    as: Tag = 'div',
    className,
    ...rest
}) => (
    <Tag className={clsx(styles.ticket, styles[direction], className)} {...rest}>
        <div className={clsx(styles.main, styles[tone])}>{main}</div>
        <div className={clsx(styles.stub, styles[stubTone])}>{stub}</div>
    </Tag>
);

export default Ticket;
