import { useCallback, useEffect, useState } from "react";
import { socket } from "../socket";
import { getBookedByDate } from "../services/booking";

const EVENTS = ["newBooking", "editBooking"];

/**
 * Khung giờ đã có người giữ của 1 phòng trong ngày (day: 'YYYY-MM-DD').
 * Tải lại khi có đơn mới/đổi trạng thái ở cùng phòng.
 */
export const useBookingsRealtime = (roomID, day) => {
    const [roomData, setRoomData] = useState(null);

    const loadData = useCallback(async () => {
        if (!roomID || !day) return setRoomData(null);
        try {
            setRoomData(await getBookedByDate(roomID, day));
        } catch {
            setRoomData(null);
        }
    }, [roomID, day]);

    useEffect(() => {
        loadData();
        const onChange = (booking) =>
            String(booking?.room?._id ?? booking?.room) === String(roomID) &&
            loadData();
        EVENTS.forEach((e) => socket.on(e, onChange));
        return () => EVENTS.forEach((e) => socket.off(e, onChange));
    }, [roomID, loadData]);

    return roomData;
};
