import accountModel from '../models/accountModel.js';
import bookingModel, { BOOKING_STATUS } from '../models/bookingModel.js';
import reviewModel from '../models/reviewModel.js';
import { asyncHandler, fail, ok } from '../utils/http.js';
import { formatString } from '../utils/format.js';

export const createReview = asyncHandler(async (req, res) => {
    const { bookingId, comment } = req.body;
    const rating = Number(req.body.rating);
    if (!(rating >= 1 && rating <= 5)) fail(400, 'Vui lòng chọn từ 1 đến 5 sao');

    const booking = await bookingModel.findOne({ _id: bookingId, email: req.user.email }).populate('room');
    if (!booking) fail(404, 'Đơn đặt phòng không tồn tại');
    if (booking.status !== BOOKING_STATUS.DONE) fail(400, 'Chỉ được đánh giá sau khi hoàn thành đơn đặt phòng');
    if (booking.isReviewed) fail(400, 'Đơn đặt phòng này đã được đánh giá');

    const review = await reviewModel.create({
        email: req.user.email,
        branch: booking.room.branch,
        booking: booking._id,
        rating,
        comment: formatString(comment).slice(0, 1000),
    });
    booking.isReviewed = true;
    await booking.save();
    ok(res, review, 'Đánh giá thành công', 201);
});

// Kèm tên người đánh giá (1 truy vấn cho tất cả tài khoản)
export const getReviewByBranch = asyncHandler(async (req, res) => {
    const reviews = await reviewModel.find({ branch: req.params.branchId }).sort({ createdAt: -1 }).lean();
    const accounts = await accountModel.find({ email: { $in: reviews.map((r) => r.email) } }, 'email name').lean();
    const names = Object.fromEntries(accounts.map((a) => [a.email, a.name]));

    // Không trả email người đánh giá ra ngoài
    ok(
        res,
        reviews.map(({ email, ...r }) => ({ ...r, name: names[email] || 'Khách hàng' })),
    );
});
