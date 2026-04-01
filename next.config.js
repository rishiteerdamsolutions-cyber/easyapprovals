/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-lib'],
  },
  async redirects() {
    return [{ source: '/services', destination: '/order', permanent: false }];
  },
}

module.exports = nextConfig

