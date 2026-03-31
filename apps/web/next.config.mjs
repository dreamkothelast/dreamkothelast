/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  ...(isProd && { output: 'export', trailingSlash: true }),
  basePath: isProd ? '/dreamkothelast' : '',
  assetPrefix: isProd ? '/dreamkothelast/' : '',
  images: { unoptimized: true },
  async rewrites() {
    if (isProd) return []
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
