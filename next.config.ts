import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')
const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    // Media are pre-resized server-side into named variants (thumbnail 200w /
    // card 480w / gallery 960w / og 1200w — see src/collections/Media.ts), and
    // nothing in the frontend renders wider than that, so the Next.js default
    // deviceSizes (up to 3840w) would only ever generate breakpoints nothing
    // requests. Trimmed to match real usage; minimumCacheTTL raised since
    // Media uploads are immutable per-URL (new upload = new filename).
    deviceSizes: [384, 480, 640, 750, 960, 1200, 1440],
    minimumCacheTTL: 2678400, // 31 days
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/**',
      },
    ],
    remotePatterns: process.env.S3_PUBLIC_HOSTNAME
      ? [
          {
            protocol: 'https',
            hostname: process.env.S3_PUBLIC_HOSTNAME,
          },
        ]
      : [],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  async headers() {
    // No Content-Security-Policy here on purpose: a strict CSP risks breaking
    // Payload admin's inline scripts/styles and next/og image generation.
    // Add one deliberately (start with Report-Only) once the app is live.
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

export default withNextIntl(withPayload(nextConfig, { devBundleServerPackages: false }))
