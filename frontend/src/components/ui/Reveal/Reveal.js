import { Children, cloneElement, isValidElement } from 'react';
import clsx from 'clsx';
import useInView from '@/hooks/useInView';
import styles from './Reveal.module.scss';

/** Hiện dần khi cuộn tới; con trực tiếp xuất hiện so le cách nhau `stagger` ms. */
const Reveal = ({ as: Tag = 'div', stagger = 60, className, children, ...rest }) => {
    const [ref, inView] = useInView();
    let index = 0;
    const items = Children.map(children, (child) =>
        isValidElement(child)
            ? cloneElement(child, { style: { ...child.props.style, '--delay': `${index++ * stagger}ms` } })
            : child,
    );

    return (
        <Tag ref={ref} className={clsx(styles.reveal, inView && styles.in, className)} {...rest}>
            {items}
        </Tag>
    );
};

export default Reveal;
