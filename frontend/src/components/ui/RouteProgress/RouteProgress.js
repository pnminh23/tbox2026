import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './RouteProgress.module.scss';

/** Thanh tiến trình mảnh khi chuyển trang (bỏ qua đổi URL shallow). */
const RouteProgress = () => {
    const router = useRouter();
    const [state, setState] = useState('idle'); // idle | loading | done

    useEffect(() => {
        let timer;
        const start = (url, { shallow }) => !shallow && setState('loading');
        const end = () => {
            setState((s) => (s === 'loading' ? 'done' : s));
            clearTimeout(timer);
            timer = setTimeout(() => setState('idle'), 300);
        };
        router.events.on('routeChangeStart', start);
        router.events.on('routeChangeComplete', end);
        router.events.on('routeChangeError', end);
        return () => {
            clearTimeout(timer);
            router.events.off('routeChangeStart', start);
            router.events.off('routeChangeComplete', end);
            router.events.off('routeChangeError', end);
        };
    }, [router]);

    if (state === 'idle') return null;
    return <div className={`${styles.bar} ${styles[state]}`} role="progressbar" aria-label="Đang tải trang" />;
};

export default RouteProgress;
