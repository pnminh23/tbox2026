import express from 'express';
import { requireAdmin } from '../middlewares/authMiddleware.js';
import { createTimeSlots, getAllTimeSlots } from '../controllers/timeSlotsController.js';
const TimeSlotsRouter = express.Router();

TimeSlotsRouter.post('/create', requireAdmin, createTimeSlots);
TimeSlotsRouter.get('/get-all', getAllTimeSlots);

export default TimeSlotsRouter;
