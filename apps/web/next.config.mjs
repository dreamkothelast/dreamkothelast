/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // Basepath = nom du repo pour GitHub Pages
  basePath: isProd ? '/dreamkothelast' : '',
  assetPrefix: isProd ? '/dreamkothelast/' : '',
  images: { unoptimized: true },
}

export default nextConfig
