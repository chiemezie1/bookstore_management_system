/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure API routes are not affected by any redirects
  async redirects() {
    return []
  },
  // Ensure API routes are not affected by any rewrites
  async rewrites() {
    return []
  }
}

module.exports = nextConfig