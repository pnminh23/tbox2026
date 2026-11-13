import express from 'express';
import { requireAdmin } from '../middlewares/authMiddleware.js';
import {
    createPromotion,
    deletePromotion,
    editPromotion,
    getAllPromotion,
    getPromotionById,
} from '../controllers/promotionController.js';

const PromotionRouter = express.Router();

PromotionRouter.post('/create', requireAdmin, createPromotion);
PromotionRouter.get('/get-all', requireAdmin, getAllPromotion);
PromotionRouter.get('/get/:_id', requireAdmin, getPromotionById);
PromotionRouter.put('/edit/:_id', requireAdmin, editPromotion);
PromotionRouter.delete('/delete/:_id', requireAdmin, deletePromotion);

export default PromotionRouter;
