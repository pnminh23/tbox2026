import mongoose from 'mongoose';

// Bộ đếm tăng nguyên tử, dùng sinh mã đơn theo ngày
const counterSchema = new mongoose.Schema({
    _id: { type: String },
    seq: { type: Number, default: 0 },
});

const counterModel = mongoose.models.counter || mongoose.model('counter', counterSchema);

export const nextSeq = async (key) =>
    (await counterModel.findOneAndUpdate({ _id: key }, { $inc: { seq: 1 } }, { upsert: true, new: true })).seq;

export default counterModel;
