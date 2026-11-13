import express from 'express';
import { requireAdmin, requireAuth } from '../middlewares/authMiddleware.js';
import {
    deleteAccountByEmail,
    editAccountDataByEmail,
    getAllUsersData,
    getUserData,
    getUserDataByEmail,
    toggleLockAccountByEmail,
    updateMe,
} from '../controllers/accountController.js';
import { uploader } from '../config/cloudinary.js';

const AccountRouter = express.Router();

AccountRouter.get('/data', requireAuth, getUserData);
AccountRouter.put('/me', requireAuth, uploader.single('image'), updateMe);

AccountRouter.get('/all-account-data', requireAdmin, getAllUsersData);
AccountRouter.post('/toggle-lock', requireAdmin, toggleLockAccountByEmail);
AccountRouter.get('/account-by-email/:email', requireAdmin, getUserDataByEmail);
AccountRouter.put('/edit-account-by-email/:email', requireAdmin, uploader.single('image'), editAccountDataByEmail);
AccountRouter.delete('/delete/:email', requireAdmin, deleteAccountByEmail);

export default AccountRouter;
