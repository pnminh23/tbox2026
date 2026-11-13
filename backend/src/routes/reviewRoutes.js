import express from 'express';
import { createReview, getReviewByBranch } from '../controllers/reviewController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const ReviewRouter = express.Router();

ReviewRouter.post('/create', requireAuth, createReview);
ReviewRouter.get('/get-by-branch/:branchId', getReviewByBranch);

export default ReviewRouter;
