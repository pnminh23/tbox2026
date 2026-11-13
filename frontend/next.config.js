const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Cho phép `@use "motion"` trong mọi CSS module
    sassOptions: { includePaths: [path.join(__dirname, "src/styles")] },
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
};

module.exports = nextConfig;
