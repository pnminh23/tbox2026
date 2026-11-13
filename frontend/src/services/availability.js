import useSWR from 'swr';
import { fetcher } from '../config/axios';

/** Phòng đang hoạt động của 1 cơ sở trong ngày, kèm giá/phút và các khung đã có người giữ. */
export const useAvailability = (branch, date) => {
    const key = branch && date ? `/api/booking/availability?branch=${branch}&date=${date}` : null;
    const { data, error, isLoading, mutate } = useSWR(key, fetcher, { keepPreviousData: true });
    return { rooms: data?.data?.rooms, isLoading, error, mutate };
};
