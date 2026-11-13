import { useEffect, useRef, useState } from 'react';

/** true một lần khi phần tử vào khung nhìn (dùng cho hiệu ứng hiện dần). */
export const useInView = ({ threshold = 0.15, rootMargin = '0px 0px -10% 0px' } = {}) => {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node || inView) return;
        if (typeof IntersectionObserver === 'undefined') return setInView(true);

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold, rootMargin },
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [inView, threshold, rootMargin]);

    return [ref, inView];
};

export default useInView;
