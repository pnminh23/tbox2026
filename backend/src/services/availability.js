const byRoomNumber = (a, b) => a.name.localeCompare(b.name, 'vi', { numeric: true });

/**
 * Phòng đang hoạt động kèm giá/phút và các khung giờ đã có người giữ.
 * rooms: đã populate type; bookings: { room, time_slots } của các đơn còn giữ chỗ trong ngày.
 */
export const buildAvailability = (rooms, bookings) => {
    const booked = new Map();
    bookings.forEach(({ room, time_slots }) => {
        const set = booked.get(String(room)) || new Set();
        time_slots.forEach((slot) => set.add(String(slot)));
        booked.set(String(room), set);
    });

    return rooms
        .filter((r) => r.status === 'Active')
        .sort(byRoomNumber)
        .map(({ _id, name, image, type }) => ({
            _id,
            name,
            image,
            type: { _id: type?._id, name: type?.name, pricePerMinute: type?.base_price_per_minute },
            bookedSlots: [...(booked.get(String(_id)) || [])],
        }));
};
