/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // In Next.js 14/15/16, allowedOrigins usually lives inside experimental
  experimental: {
    serverActions: {
      allowedOrigins: ['smartearningplatformbd.net'],
    },
  },
};

// Use ESM export instead of module.exports
export default nextConfig;