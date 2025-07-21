import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      'images.pexels.com',
      'res.cloudinary.com',
      'cdn.sanity.io',
      's3.amazonaws.com',
    ],
  },
};

export default nextConfig;
