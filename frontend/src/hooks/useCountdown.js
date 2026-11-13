import { useEffect, useState } from 'react';
import { holdRemaining } from '@/lib/booking.mjs';

/** Đếm ngược thời gian giữ chỗ, cập nhật mỗi giây khi `active`. */
export const useCountdown = (createdAt, active) => {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        if (!active) return;
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, [active]);
    return createdAt ? holdRemaining(createdAt, now) : null;
};

export default useCountdown;
