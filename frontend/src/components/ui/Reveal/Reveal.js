import { Children, cloneElement, isValidElement, useEffect, useState } from 'react';
import clsx from 'clsx';
import useInView from '@/hooks/useInView';
import styles from './Reveal.module.scss';

/**
 * Hiện dần khi cuộn tới; con trực tiếp xuất hiện so le cách nhau `stagger` ms.
 * Chỉ ẩn sau khi JS chạy (armed) để HTML từ server vẫn đọc được khi chưa có JS.
 */
const Reveal = ({ as: Tag = 'div', stagger = 60, className, children, ...rest }) => {
    const [ref, inView] = useInView();
    const [armed, setArmed] = useState(false);
    useEffect(() => setArmed(true), []);
    let index = 0;
    const items = Children.map(children, (child) =>
        isValidElement(child)
            ? cloneElement(child, { style: { ...child.props.style, '--delay': `${index++ * stagger}ms` } })
            : child,
    );

    return (
        <Tag ref={ref} className={clsx(armed && styles.reveal, inView && styles.in, className)} {...rest}>
            {items}
        </Tag>
    );
};

export default Reveal;
