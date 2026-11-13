import roomModel from '../models/roomModel.js';
import roomTypeModel from '../models/roomTypeModel.js';
import { asyncHandler, fail, ok } from '../utils/http.js';
import { formatString } from '../utils/format.js';

export const createTypeRoom = asyncHandler(async (req, res) => {
    const name = formatString(req.body.name);
    const price = Number(req.body.price);
    if (!name || !(price > 0)) fail(400, 'Thiếu tên hoặc giá');
    ok(res, await roomTypeModel.create({ name, base_price_per_minute: price }), 'Tạo loại phòng thành công', 201);
});

export const getAllTypeRooms = asyncHandler(async (req, res) => ok(res, await roomTypeModel.find()));

export const editTypeRoom = asyncHandler(async (req, res) => {
    const typeRoom = await roomTypeModel.findById(req.params._id);
    if (!typeRoom) fail(404, 'Không tìm thấy loại phòng');

    if (req.body.name) typeRoom.name = formatString(req.body.name);
    if (req.body.price) typeRoom.base_price_per_minute = Number(req.body.price);
    await typeRoom.save();
    ok(res, typeRoom, 'Cập nhật loại phòng thành công');
});

export const deleteTypeRoom = asyncHandler(async (req, res) => {
    if (await roomModel.exists({ type: req.params._id })) fail(400, 'Không thể xóa vì vẫn còn phòng thuộc loại này');
    if (!(await roomTypeModel.findByIdAndDelete(req.params._id))) fail(404, 'Không tìm thấy loại phòng');
    ok(res, null, 'Xóa loại phòng thành công');
});
