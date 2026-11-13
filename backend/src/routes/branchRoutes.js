import express from 'express';
import { requireAdmin } from '../middlewares/authMiddleware.js';
import {
    createBranch,
    deleteBranch,
    editBranch,
    getAllBranch,
    getBranchById,
} from '../controllers/branchController.js';
const BranchRouter = express.Router();

BranchRouter.post('/create', requireAdmin, createBranch);
BranchRouter.get('/get-all', getAllBranch);
BranchRouter.get('/get/:_id', getBranchById);
BranchRouter.put('/edit/:_id', requireAdmin, editBranch);
BranchRouter.delete('/delete/:_id', requireAdmin, deleteBranch);

export default BranchRouter;
