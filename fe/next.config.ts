// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Cho phép tất cả hostname
      },
      {
        protocol: 'http',
        hostname: '**', // Cho phép tất cả hostname với HTTP
      }
    ],
  },
};

module.exports = nextConfig;
