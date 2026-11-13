import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true, uppercase: true, trim: true },
        discountPercent: { type: Number, required: true, min: 1, max: 100 },
        quantity: { type: Number, required: true, min: 0 },
    },
    { timestamps: true },
);

const promotionModel = mongoose.models.promotions || mongoose.model('promotions', promotionSchema);

export default promotionModel;
