import mongoose from 'mongoose';

// Mỗi (phòng, ngày, khung giờ) chỉ có 1 bản ghi → unique index chống đặt trùng khi nhiều người đặt cùng lúc
const slotLockSchema = new mongoose.Schema({
    room: { type: mongoose.Schema.Types.ObjectId, required: true },
    day: { type: String, required: true }, // YYYY-MM-DD theo giờ VN
    slot: { type: mongoose.Schema.Types.ObjectId, required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
});

slotLockSchema.index({ room: 1, day: 1, slot: 1 }, { unique: true });

const slotLockModel = mongoose.models.slotLock || mongoose.model('slotLock', slotLockSchema);

export default slotLockModel;
