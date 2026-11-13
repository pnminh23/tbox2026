import filmModel from '../models/filmModel.js';
import bookingModel from '../models/bookingModel.js';
import { destroyImage } from '../config/cloudinary.js';
import { asyncHandler, fail, ok } from '../utils/http.js';
import { formatString } from '../utils/format.js';

// "hành động - phiêu lưu" → "Hành Động - Phiêu Lưu"
const normalizeCategory = (str) =>
    formatString(str)
        .split('-')
        .map((part) =>
            part
                .trim()
                .split(' ')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(' '),
        )
        .join(' - ');

const toCategories = (category) => [].concat(category).filter(Boolean).map(normalizeCategory);

const TEXT_FIELDS = ['name', 'nameEnglish', 'release_date', 'duration', 'country'];

const pickFilm = (body) => {
    const data = {};
    TEXT_FIELDS.forEach((key) => body[key] !== undefined && (data[key] = formatString(String(body[key]))));
    if (body.category !== undefined) data.category = toCategories(body.category);
    return data;
};

const findFilm = async (_id) => {
    const film = await filmModel.findById(_id);
    if (!film) fail(404, 'Không tìm thấy phim');
    return film;
};

export const createFilm = asyncHandler(async (req, res) => {
    const data = pickFilm(req.body);
    if (TEXT_FIELDS.some((k) => !data[k]) || !data.category?.length) fail(400, 'Hãy nhập đầy đủ các trường');
    if (!req.file) fail(400, 'Thiếu ảnh');

    const film = await filmModel.create({ ...data, image: req.file.path, imagePublicId: req.file.filename });
    ok(res, film, 'Thêm phim thành công', 201);
});

export const getAllFilms = asyncHandler(async (req, res) => ok(res, await filmModel.find().sort({ createdAt: -1 })));

export const getFilmsByCurrentYear = asyncHandler(async (req, res) =>
    ok(res, await filmModel.find({ release_date: String(new Date().getFullYear()) }).sort({ createdAt: -1 })),
);

export const getFilmById = asyncHandler(async (req, res) => ok(res, await findFilm(req.params._id)));

export const getFilmsByCategory = asyncHandler(async (req, res) => {
    if (!req.query.name) fail(400, 'Thiếu tham số thể loại (name)');
    ok(res, await filmModel.find({ category: normalizeCategory(req.query.name) }));
});

export const getFilmsByYear = asyncHandler(async (req, res) => {
    if (!req.query.release_date) fail(400, 'Thiếu tham số release_date');
    ok(res, await filmModel.find({ release_date: req.query.release_date }));
});

export const getTop10MostBookedFilms = asyncHandler(async (req, res) => {
    const topFilms = await bookingModel.aggregate([
        { $match: { film: { $ne: null } } },
        { $group: { _id: '$film', totalBookings: { $sum: 1 } } },
        { $sort: { totalBookings: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'films', localField: '_id', foreignField: '_id', as: 'film' } },
        { $unwind: '$film' },
        { $replaceRoot: { newRoot: { $mergeObjects: ['$film', { totalBookings: '$totalBookings' }] } } },
    ]);
    ok(
        res,
        topFilms.map((film, index) => ({ ...film, index })),
    );
});

export const editFilms = asyncHandler(async (req, res) => {
    const film = await findFilm(req.params._id);
    Object.assign(film, pickFilm(req.body));
    if (req.file) {
        await destroyImage(film.imagePublicId);
        film.image = req.file.path;
        film.imagePublicId = req.file.filename;
    }
    await film.save();
    ok(res, film, 'Cập nhật thành công');
});

export const deleteFilm = asyncHandler(async (req, res) => {
    const film = await findFilm(req.params._id);
    await destroyImage(film.imagePublicId);
    await film.deleteOne();
    ok(res, null, 'Xóa phim thành công');
});
