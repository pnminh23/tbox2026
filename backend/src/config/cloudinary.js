import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';
import { env } from './env.js';

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

const FOLDER = 'pnm-box-images';
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

const memory = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => cb(null, ALLOWED.includes(file.mimetype)),
});

const uploadBuffer = (buffer) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: FOLDER }, (err, result) =>
            err ? reject(err) : resolve(result),
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });

// Giữ API giống multer-storage-cloudinary: req.file.path = URL, req.file.filename = public_id
export const uploader = {
    single: (field) => [
        memory.single(field),
        async (req, res, next) => {
            if (!req.file) return next();
            try {
                const { secure_url, public_id } = await uploadBuffer(req.file.buffer);
                req.file.path = secure_url;
                req.file.filename = public_id;
                next();
            } catch (err) {
                next(err);
            }
        },
    ],
};

export const destroyImage = (publicId) => publicId && cloudinary.uploader.destroy(publicId).catch(() => {});

export { cloudinary };
