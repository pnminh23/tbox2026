import express from 'express';
import {
    createBooking,
    editBooking,
    getAllBookings,
    getAvailability,
    getBookedByEmail,
    getBookedByEmailAndMonth,
    getBookedByEmailCurrent,
    getBookedById,
    getBookedByOrderCode,
    getBookedTimeSlotsByRoom,
    getBookingsByDate,
    getBookingsByMonth,
    getBookingStatsByEmail,
    getCurrentActiveRoomsWithBookingId,
} from '../controllers/bookingController.js';
import { optionalAuth, requireAdmin, requireAuth } from '../middlewares/authMiddleware.js';

const BookingRouter = express.Router();

// Công khai (khách vãng lai đặt được; chi tiết đơn bị ẩn email/SĐT nếu không phải chủ đơn)
BookingRouter.post('/create', optionalAuth, createBooking);
BookingRouter.get('/availability', getAvailability);
BookingRouter.get('/get-book-timeSlots-by-room/:room/:date', getBookedTimeSlotsByRoom);
BookingRouter.get('/get-booking-by-orderCode/:orderCode', optionalAuth, getBookedByOrderCode);
BookingRouter.get('/get-booking-by-id/:id_booking', optionalAuth, getBookedById);

// Người dùng đăng nhập
BookingRouter.get('/get-all-booking-by-email', requireAuth, getBookedByEmail);
BookingRouter.get('/get-booking-by-email-current', requireAuth, getBookedByEmailCurrent);
BookingRouter.get('/get-booking-stats-by-email', requireAuth, getBookingStatsByEmail);
BookingRouter.get('/get-booking-by-email-and-month/:month/:year', requireAuth, getBookedByEmailAndMonth);
BookingRouter.put('/edit/:_id', requireAuth, editBooking);

// Admin
BookingRouter.get('/get-room-booking-current', requireAdmin, getCurrentActiveRoomsWithBookingId);
BookingRouter.get('/get-all-booking', requireAdmin, getAllBookings);
BookingRouter.get('/get-all-booking-by-date', requireAdmin, getBookingsByDate);
BookingRouter.get('/get-all-booking-by-month', requireAdmin, getBookingsByMonth);

export default BookingRouter;
