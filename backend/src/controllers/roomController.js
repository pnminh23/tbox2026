import roomModel from '../models/roomModel.js';
import bookingModel, { BOOKING_STATUS } from '../models/bookingModel.js';
import { destroyImage } from '../config/cloudinary.js';
import { asyncHandler, fail, ok } from '../utils/http.js';
import { formatString } from '../utils/format.js';
import { now } from '../utils/time.js';
import { isAdmin } from '../middlewares/authMiddleware.js';

const STATUSES = ['Active', 'Inactive'];

const findRoom = async (_id) => {
    const room = await roomModel.findById(_id);
    if (!room) fail(404, 'Không tìm thấy phòng');
    return room;
};

const pickStatus = (status) => {
    if (status === undefined) return undefined;
    if (!STATUSES.includes(status)) fail(400, 'Trạng thái phòng không hợp lệ');
    return status;
};

export const createRoom = asyncHandler(async (req, res) => {
    const { branch, type } = req.body;
    const name = formatString(req.body.name).toUpperCase();
    if (!name || !branch || !type) fail(400, 'Hãy nhập đầy đủ các trường');
    if (!req.file) fail(400, 'Thiếu ảnh');
    if (await roomModel.exists({ branch, name })) fail(409, 'Phòng này đã tồn tại');

    const room = await roomModel.create({
        branch,
        type,
        name,
        status: pickStatus(req.body.status),
        image: req.file.path,
        imagePublicId: req.file.filename,
    });
    ok(res, room, 'Thêm phòng thành công', 201);
});

export const editRoom = asyncHandler(async (req, res) => {
    const room = await findRoom(req.params._id);
    const { name, type, status } = req.body;

    if (name) room.name = formatString(name).toUpperCase();
    if (type) room.type = type;
    if (status !== undefined) room.status = pickStatus(status);
    if (req.file) {
        await destroyImage(room.imagePublicId);
        room.image = req.file.path;
        room.imagePublicId = req.file.filename;
    }
    await room.save();
    ok(res, room, 'Cập nhật phòng thành công');
});

// Khách chỉ thấy phòng đang hoạt động; admin thấy tất cả
export const getRoom = asyncHandler(async (req, res) => {
    const { branch, type } = req.params;
    const filter = isAdmin(req.user) ? { branch, type } : { branch, type, status: 'Active' };
    ok(res, await roomModel.find(filter).populate('type').sort({ name: 1 }));
});

export const getRoomByBranchId = asyncHandler(async (req, res) => {
    ok(res, await roomModel.find({ branch: req.params.branch }).populate('type').sort({ name: 1 }));
});

export const deleteRoom = asyncHandler(async (req, res) => {
    const room = await findRoom(req.params._id);
    const upcoming = await bookingModel.exists({
        room: room._id,
        date: { $gte: now().startOf('day').toDate() },
        status: { $in: [BOOKING_STATUS.SUCCESS, BOOKING_STATUS.PENDING] },
    });
    if (upcoming) fail(400, 'Phòng còn đơn đặt sắp tới, hãy chuyển sang "Inactive" thay vì xóa');

    await destroyImage(room.imagePublicId);
    await room.deleteOne();
    ok(res, null, 'Xóa phòng thành công');
});
