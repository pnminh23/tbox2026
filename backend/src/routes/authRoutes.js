import express from 'express';
import {
    forgotPassword,
    login,
    logout,
    register,
    resendOTP,
    resetPassword,
    verifyEmail,
    verifyOtpResetPassword,
} from '../controllers/authController.js';
import { authLimiter, otpLimiter } from '../middlewares/rateLimit.js';

const authRouter = express.Router();

authRouter.post('/register', authLimiter, register);
authRouter.post('/login', authLimiter, login);
authRouter.post('/logout', logout);
authRouter.post('/verify-account', otpLimiter, verifyEmail);
authRouter.post('/resend-otp', otpLimiter, resendOTP);
authRouter.post('/forgotPassword', otpLimiter, forgotPassword);
authRouter.post('/verify-otp-reset-password', otpLimiter, verifyOtpResetPassword);
authRouter.post('/reset-password', otpLimiter, resetPassword);

export default authRouter;
