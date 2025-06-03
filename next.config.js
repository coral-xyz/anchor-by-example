const withMarkdoc = require('@markdoc/next.js')
const { withPlausibleProxy } = require('next-plausible')

/** @type {import('next').NextConfig} */
const nextConfig = withMarkdoc()({
  swcMinify: true,
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'md'],
  experimental: {
    scrollRestoration: true,
    legacyBrowsers: false,
    images: { allowFutureImage: true },
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        destination: 'https://www.anchor-lang.com/docs/references/examples',
        permanent: true,
      },
    ]
  },
})

module.exports = withPlausibleProxy()(nextConfig)
