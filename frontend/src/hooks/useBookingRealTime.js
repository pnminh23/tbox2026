import { useEffect, useRef } from 'react';
import { socket } from '../socket';

const EVENTS = ['newBooking', 'editBooking'];

/** Gọi `onChange(booking)` mỗi khi có đơn mới hoặc đơn đổi trạng thái (qua socket). */
export const useBookingEvents = (onChange) => {
    const handler = useRef(onChange);
    handler.current = onChange;

    useEffect(() => {
        const listener = (booking) => handler.current?.(booking);
        EVENTS.forEach((e) => socket.on(e, listener));
        return () => EVENTS.forEach((e) => socket.off(e, listener));
    }, []);
};

export default useBookingEvents;
