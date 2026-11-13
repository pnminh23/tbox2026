import cron from 'node-cron';
import bookingModel, { BOOKING_STATUS, PAY_STATUS } from '../models/bookingModel.js';
import { HOLD_MINUTES, populateBooking, releaseBooking } from './booking.js';
import dayjs, { dayRange, now, slotTime } from '../utils/time.js';

// Đơn chờ thanh toán quá hạn → THẤT BẠI, trả chỗ và mã giảm giá
const expirePendingBookings = async (io) => {
    const expired = await populateBooking(
        bookingModel.find({
            status: BOOKING_STATUS.PENDING,
            createdAt: { $lt: dayjs().subtract(HOLD_MINUTES, 'minute').toDate() },
        }),
    );
    for (const booking of expired) {
        booking.status = BOOKING_STATUS.FAILED;
        await booking.save();
        await releaseBooking(booking);
        io.emit('editBooking', booking);
    }
};

// Đơn đã thanh toán đủ và đã hết giờ → HOÀN THÀNH (để khách đánh giá)
const completeFinishedBookings = async (io) => {
    const candidates = await populateBooking(
        bookingModel.find({
            status: BOOKING_STATUS.SUCCESS,
            isPay: PAY_STATUS.FULL,
            date: { $lte: dayRange(now()).$lte },
        }),
    );
    for (const booking of candidates) {
        const [first, last] = [booking.time_slots[0], booking.time_slots.at(-1)];
        if (!last) continue;
        // Khung giờ kết thúc lúc 00:00 thuộc ngày hôm sau
        const end = slotTime(booking.date, last.end_time).add(last.end_time <= first.start_time ? 1 : 0, 'day');
        if (end.isAfter(now())) continue;
        booking.status = BOOKING_STATUS.DONE;
        await booking.save();
        io.emit('editBooking', booking);
    }
};

const run = (job, io) => job(io).catch((err) => console.error(`Cron ${job.name}:`, err.message));

export const startBookingCleanupJob = (io) => {
    cron.schedule('* * * * *', () => run(expirePendingBookings, io));
    cron.schedule('*/5 * * * *', () => run(completeFinishedBookings, io));
};
