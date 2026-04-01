/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-lib'],
  },
}

module.exports = nextConfig

