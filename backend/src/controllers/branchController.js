import branchModel from '../models/branchModel.js';
import roomModel from '../models/roomModel.js';
import roomTypeModel from '../models/roomTypeModel.js';
import { asyncHandler, fail, ok } from '../utils/http.js';
import { formatString } from '../utils/format.js';

const byRoomNumber = (a, b) => a.name.localeCompare(b.name, 'vi', { numeric: true });

const findBranch = async (_id) => {
    const branch = await branchModel.findById(_id);
    if (!branch) fail(404, 'Không tìm thấy cơ sở');
    return branch;
};

export const createBranch = asyncHandler(async (req, res) => {
    const name = formatString(req.body.name).toUpperCase();
    const address = formatString(req.body.address);
    const phone = formatString(req.body.phone);
    if (!name || !address || !phone) fail(400, 'Hãy nhập đầy đủ các trường');

    // Mặc định cơ sở mới có tất cả loại phòng
    const typeRoom = await roomTypeModel.distinct('_id');
    ok(res, await branchModel.create({ name, address, phone, typeRoom }), 'Thêm cơ sở mới thành công', 201);
});

// Kèm danh sách phòng của từng cơ sở
export const getAllBranch = asyncHandler(async (req, res) => {
    const [branches, rooms] = await Promise.all([
        branchModel.find().populate('typeRoom').lean(),
        roomModel.find().populate('type').lean(),
    ]);
    ok(
        res,
        branches.map((branch) => ({
            ...branch,
            rooms: rooms.filter((r) => String(r.branch) === String(branch._id)).sort(byRoomNumber),
        })),
    );
});

export const getBranchById = asyncHandler(async (req, res) => {
    const branch = await branchModel.findById(req.params._id).populate('typeRoom');
    if (!branch) fail(404, 'Không tìm thấy cơ sở');
    ok(res, branch);
});

export const editBranch = asyncHandler(async (req, res) => {
    const branch = await findBranch(req.params._id);
    const { name, phone, address, typeRoom } = req.body;

    if (name) branch.name = formatString(name).toUpperCase();
    if (phone) branch.phone = formatString(phone);
    if (address) branch.address = formatString(address);
    if (Array.isArray(typeRoom)) branch.typeRoom = typeRoom;

    await branch.save();
    ok(res, branch, `Cập nhật cơ sở ${branch.name} thành công`);
});

export const deleteBranch = asyncHandler(async (req, res) => {
    const branch = await findBranch(req.params._id);
    if (await roomModel.exists({ branch: branch._id })) fail(400, 'Cơ sở vẫn còn phòng, hãy xóa phòng trước');
    await branch.deleteOne();
    ok(res, null, 'Xóa cơ sở thành công');
});
