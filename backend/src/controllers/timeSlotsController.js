import timeSlotModel from '../models/timeSlotModel.js';
import { asyncHandler, fail, ok } from '../utils/http.js';

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const toMinutes = (hhmm) => hhmm.split(':').reduce((h, m) => h * 60 + Number(m));

export const createTimeSlots = asyncHandler(async (req, res) => {
    const { start_time, end_time } = req.body;
    if (!HHMM.test(start_time) || !HHMM.test(end_time)) fail(400, 'Giờ phải có dạng HH:mm');

    // Cho phép khung giờ kết thúc lúc 00:00 (qua nửa đêm)
    const duration = (toMinutes(end_time) - toMinutes(start_time) + 1440) % 1440;
    if (!duration) fail(400, 'Giờ kết thúc phải sau giờ bắt đầu');

    ok(
        res,
        await timeSlotModel.create({ start_time, end_time, slot_duration: duration }),
        'Thêm khung giờ mới thành công',
        201,
    );
});

export const getAllTimeSlots = asyncHandler(async (req, res) =>
    ok(res, await timeSlotModel.find().sort({ start_time: 1 })),
);
