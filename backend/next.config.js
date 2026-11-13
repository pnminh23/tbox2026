/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
                port: "2911",
                pathname: "/uploads/**",
            },
            {
                protocol: "https",
                hostname: "res.cloudinary.com", // Tên miền của Cloudinary
            },
        ],
    },
    env: {
        JWT_SECRET: process.env.JWT_SECRET,
    },
};

module.exports = nextConfig;
