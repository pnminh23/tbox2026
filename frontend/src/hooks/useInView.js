import { useEffect, useRef, useState } from 'react';

/**
 * Theo dõi phần tử có trong khung nhìn không.
 * once (mặc định): chỉ báo true một lần (hiệu ứng hiện dần); once=false: theo dõi liên tục.
 */
export const useInView = ({ threshold = 0.15, rootMargin = '0px 0px -10% 0px', once = true, initial = false } = {}) => {
    const ref = useRef(null);
    const [inView, setInView] = useState(initial);

    useEffect(() => {
        const node = ref.current;
        if (!node || (once && inView)) return;
        if (typeof IntersectionObserver === 'undefined') return setInView(true);

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!once) return setInView(entry.isIntersecting);
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold, rootMargin },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [inView, once, threshold, rootMargin]);

    return [ref, inView];
};

export default useInView;
