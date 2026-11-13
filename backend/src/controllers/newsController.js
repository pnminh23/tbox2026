import newsModel from '../models/newsModel.js';
import { destroyImage } from '../config/cloudinary.js';
import { asyncHandler, fail, ok } from '../utils/http.js';
import { formatString } from '../utils/format.js';
import { sanitizeRichText } from '../utils/sanitize.js';

const findNews = async (_id) => {
    const news = await newsModel.findById(_id);
    if (!news) fail(404, 'Không tìm thấy tin tức');
    return news;
};

export const createNews = asyncHandler(async (req, res) => {
    const { title, content } = req.body;
    if (!req.file) fail(400, 'Thiếu ảnh');
    if (!title || !content) fail(400, 'Tiêu đề và nội dung là bắt buộc');

    const news = await newsModel.create({
        title: formatString(title),
        content: sanitizeRichText(content),
        image: req.file.path,
        imagePublicId: req.file.filename,
    });
    ok(res, news, 'Tạo tin tức thành công', 201);
});

export const getAllNews = asyncHandler(async (req, res) => ok(res, await newsModel.find().sort({ createdAt: -1 })));

export const getNewsById = asyncHandler(async (req, res) => ok(res, await findNews(req.params._id)));

export const updateNews = asyncHandler(async (req, res) => {
    const news = await findNews(req.params._id);
    const { title, content } = req.body;

    if (title) news.title = formatString(title);
    if (content) news.content = sanitizeRichText(content);
    if (req.file) {
        await destroyImage(news.imagePublicId);
        news.image = req.file.path;
        news.imagePublicId = req.file.filename;
    }
    await news.save();
    ok(res, news, 'Cập nhật tin tức thành công');
});

export const deleteNews = asyncHandler(async (req, res) => {
    const news = await findNews(req.params._id);
    await destroyImage(news.imagePublicId);
    await news.deleteOne();
    ok(res, null, 'Xóa tin tức thành công');
});
