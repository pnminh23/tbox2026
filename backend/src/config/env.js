import 'dotenv/config';

const isProd = process.env.NODE_ENV === 'production';

export const env = {
    NODE_ENV: process.env.NODE_ENV,
    IS_PROD: isProd,
    APP_HOST: process.env.APP_HOST || 'localhost',
    APP_PORT: process.env.APP_PORT || 4000,
    MONGODB_URI: process.env.MONGODB_URI,
    DATABASE_NAME: process.env.DATABASE_NAME || 'tbox',
    JWT_SECRET: process.env.JWT_SECRET,
    // Danh sách origin FE được phép, phân tách bằng dấu phẩy; phần tử đầu dùng làm returnUrl PayOS
    CLIENT_URLS: (process.env.CLIENT_URL || 'http://localhost:3000').split(',').map((s) => s.trim()),
    USER_EMAIL: process.env.USER_EMAIL,
    PASSWORD_EMAIL: process.env.PASSWORD_EMAIL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    PAYOS_CLIENT_ID: process.env.PAYOS_CLIENT_ID,
    PAYOS_API_KEY: process.env.PAYOS_API_KEY,
    PAYOS_CHECKSUM_KEY: process.env.PAYOS_CHECKSUM_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};

if (!env.JWT_SECRET) throw new Error('Thiếu JWT_SECRET trong .env');

export const CLIENT_URL = env.CLIENT_URLS[0];

// Cookie cross-site cần SameSite=None + Secure khi FE/BE khác domain
export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
};
