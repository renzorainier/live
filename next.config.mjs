/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add this section to allow TikTok Studio / 127.0.0.1 to access the overlay
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
};

export default nextConfig;
// Note: If your file is next.config.js, it might use `module.exports = nextConfig;` at the bottom instead.
