import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, trim: true },
        phone: { type: String, required: true },
        // Trường nhạy cảm: không bao giờ trả ra ngoài trừ khi .select('+field')
        password: { type: String, required: true, select: false },
        image: { type: String, default: '' },
        imagePublicId: { type: String, default: '' },
        role: { type: String, enum: ['user', 'admin', 'employee'], default: 'user' },
        isActive: { type: Boolean, default: false },
        isLock: { type: Boolean, default: false },
        isResetpassword: { type: Boolean, default: false, select: false },
        verifyOTP: { type: String, default: '', select: false },
        verifyOTPExpireAt: { type: Number, default: 0, select: false },
    },
    { timestamps: true },
);

const accountModel = mongoose.models.account || mongoose.model('account', accountSchema);

export default accountModel;
