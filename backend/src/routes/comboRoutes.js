import express from 'express';
import { requireAdmin } from '../middlewares/authMiddleware.js';
import { createCombo, deleteCombo, editComboById, getAllCombo, getComboById } from '../controllers/comboController.js';

const ComboRouter = express.Router();

ComboRouter.post('/create', requireAdmin, createCombo);
ComboRouter.get('/get-all', getAllCombo);
ComboRouter.get('/get/:id', getComboById);
ComboRouter.put('/edit/:_id', requireAdmin, editComboById);
ComboRouter.delete('/delete/:_id', requireAdmin, deleteCombo);

export default ComboRouter;
