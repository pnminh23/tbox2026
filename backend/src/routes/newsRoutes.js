import express from 'express';
import { createNews, deleteNews, getAllNews, getNewsById, updateNews } from '../controllers/newsController.js';
import { uploader } from '../config/cloudinary.js';
import { requireAdmin } from '../middlewares/authMiddleware.js';

const NewsRouter = express.Router();

NewsRouter.get('/get-all', getAllNews);
NewsRouter.get('/get/:_id', getNewsById);
NewsRouter.post('/create', requireAdmin, uploader.single('image'), createNews);
NewsRouter.put('/edit/:_id', requireAdmin, uploader.single('image'), updateNews);
NewsRouter.delete('/delete/:_id', requireAdmin, deleteNews);

export default NewsRouter;
