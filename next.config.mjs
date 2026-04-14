/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ['127.0.0.1', 'localhost', 'zombiecoder.my.id', '192.168.1.218'],
  images: {
    unoptimized: true,
  },
  // In Next.js 14/15/16, allowedOrigins usually lives inside experimental
  experimental: {
    serverActions: {
      allowedOrigins: ['zombiecoder.my.id'],
    },
  },
};

// Use ESM export instead of module.exports
export default nextConfig;