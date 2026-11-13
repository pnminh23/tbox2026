import promotionModel from '../models/promotionModel.js';
import { asyncHandler, fail, ok } from '../utils/http.js';
import { formatString } from '../utils/format.js';

// Chỉ lấy các trường hợp lệ từ body
const pickPromotion = ({ name, discountPercent, quantity }) => {
    const data = {};
    if (name) data.name = formatString(name).toUpperCase();
    if (discountPercent !== undefined && discountPercent !== '') data.discountPercent = Number(discountPercent);
    if (quantity !== undefined && quantity !== '') data.quantity = Number(quantity);
    return data;
};

export const createPromotion = asyncHandler(async (req, res) => {
    const data = pickPromotion(req.body);
    if (!data.name || !data.discountPercent || data.quantity === undefined) fail(400, 'Hãy nhập đầy đủ các trường');
    ok(res, await promotionModel.create(data), 'Thêm mã khuyến mãi mới thành công', 201);
});

export const getAllPromotion = asyncHandler(async (req, res) =>
    ok(res, await promotionModel.find().sort({ createdAt: -1 })),
);

export const getPromotionById = asyncHandler(async (req, res) => {
    const promotion = await promotionModel.findById(req.params._id);
    if (!promotion) fail(404, 'Không tìm thấy mã khuyến mãi');
    ok(res, promotion);
});

export const editPromotion = asyncHandler(async (req, res) => {
    const data = pickPromotion(req.body);
    if (!Object.keys(data).length) fail(400, 'Cần ít nhất một trường để cập nhật');
    const promotion = await promotionModel.findByIdAndUpdate(req.params._id, data, { new: true, runValidators: true });
    if (!promotion) fail(404, 'Không tìm thấy mã khuyến mãi');
    ok(res, promotion, 'Cập nhật mã khuyến mãi thành công');
});

export const deletePromotion = asyncHandler(async (req, res) => {
    if (!(await promotionModel.findByIdAndDelete(req.params._id))) fail(404, 'Không tìm thấy mã khuyến mãi');
    ok(res, null, 'Xóa mã khuyến mãi thành công');
});
