import { useEffect, useRef, useState } from 'react';
import { formatMoney } from '@/function/formatMoney';

const DURATION = 400;
const reducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Số tiền đếm từ giá trị cũ tới giá trị mới khi thay đổi. */
const PriceTag = ({ value = 0, className }) => {
    const [shown, setShown] = useState(value);
    const from = useRef(value);

    useEffect(() => {
        if (reducedMotion()) return setShown(value);
        const start = from.current;
        const t0 = performance.now();
        let frame;
        const tick = (t) => {
            const p = Math.min((t - t0) / DURATION, 1);
            setShown(Math.round(start + (value - start) * (1 - (1 - p) ** 3)));
            if (p < 1) frame = requestAnimationFrame(tick);
            else from.current = value;
        };
        frame = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(frame);
            from.current = value;
        };
    }, [value]);

    return (
        <span className={className}>
            <span aria-hidden="true">{formatMoney(shown)}</span>
            <span className="sr-only" aria-live="polite">
                {formatMoney(value)}
            </span>
        </span>
    );
};

export default PriceTag;
