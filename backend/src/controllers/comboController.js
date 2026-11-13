import comboModel from '../models/comboModel.js';
import { asyncHandler, fail, ok } from '../utils/http.js';
import { formatString } from '../utils/format.js';

// Sắp xếp theo số trong tên: Combo 1, Combo 2, Combo 10
const comboNumber = (c) => parseInt(c.name.match(/\d+/)?.[0] || 0, 10);

const parseTypes = (types) => {
    if (!Array.isArray(types) || !types.length) fail(400, 'Cần ít nhất một loại phòng kèm giá');
    return types.map(({ typeRoom, price }) => {
        if (!typeRoom || !(Number(price) > 0)) fail(400, 'Mỗi loại phòng phải có giá hợp lệ');
        return { typeRoom, price: Number(price) };
    });
};

const findCombo = async (_id) => {
    const combo = await comboModel.findById(_id);
    if (!combo) fail(404, 'Không tìm thấy combo');
    return combo;
};

export const createCombo = asyncHandler(async (req, res) => {
    const name = formatString(req.body.name).toUpperCase();
    const description = formatString(req.body.description);
    const duration = Number(req.body.duration);
    if (!name || !description || !(duration > 0)) fail(400, 'Hãy nhập đầy đủ tên, mô tả và thời lượng');

    const combo = await comboModel.create({ name, description, duration, types: parseTypes(req.body.types) });
    ok(res, combo, 'Thêm combo mới thành công', 201);
});

export const getAllCombo = asyncHandler(async (req, res) => {
    const combos = await comboModel.find().populate('types.typeRoom').lean();
    ok(
        res,
        combos.sort((a, b) => comboNumber(a) - comboNumber(b)),
    );
});

export const getComboById = asyncHandler(async (req, res) => {
    const combo = await comboModel.findById(req.params.id).populate('types.typeRoom').lean();
    if (!combo) fail(404, 'Combo không tồn tại');
    ok(res, combo);
});

export const editComboById = asyncHandler(async (req, res) => {
    const combo = await findCombo(req.params._id);
    const { name, description, duration, types } = req.body;

    if (name) combo.name = formatString(name).toUpperCase();
    if (description) combo.description = formatString(description);
    if (Number(duration) > 0) combo.duration = Number(duration);
    if (types) combo.types = parseTypes(types);

    await combo.save();
    ok(res, combo, `Cập nhật ${combo.name} thành công`);
});

export const deleteCombo = asyncHandler(async (req, res) => {
    const combo = await findCombo(req.params._id);
    await combo.deleteOne();
    ok(res, null, 'Xóa combo thành công');
});
