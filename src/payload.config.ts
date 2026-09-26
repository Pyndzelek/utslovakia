import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { pl } from '@payloadcms/translations/languages/pl'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Category } from './collections/Category'
import { Product } from './collections/Product'
import { Brand } from './collections/Brand'
import { SiteSettings } from './globals/SiteSettings'
import { SITE_URL } from './lib/site'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/** Fail fast instead of booting with an empty secret / connection string. */
function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

export default buildConfig({
  // Only accept cookie-authenticated requests from the site's own origins. (No `serverURL`:
  // it would turn media URLs into absolute production URLs, breaking dev/preview images.)
  csrf: [
    SITE_URL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
    process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`,
    process.env.NODE_ENV !== 'production' && 'http://localhost:3000',
  ].filter((origin): origin is string => Boolean(origin)),
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: '/components/admin/logo#Logo', // shown on login/create-first-user view
        Icon: '/components/admin/icon#Icon', // small mark shown in the nav
      },
      // you can also override beforeLogin, afterLogin, beforeDashboard, etc.
    },
    meta: {
      titleSuffix: '- UTS Admin',
    },
  },
  i18n: {
    supportedLanguages: { pl },
    fallbackLanguage: 'pl',
  },
  localization: {
    locales: [
      { label: 'Polski', code: 'pl' },
      { label: 'English', code: 'en' },
      { label: 'Slovenčina', code: 'sk' },
      { label: 'Português (Brasil)', code: 'pt-br' },
    ],
    defaultLocale: 'pl',
    fallback: true,
  },
  collections: [Product, Category, Brand, Media, Users],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: requiredEnv('PAYLOAD_SECRET'),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    // Schema changes go through migrations only (`pnpm migrate:create` → `pnpm migrate`),
    // never dev-mode push — push and migrations must not be mixed on one database.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
    pool: {
      connectionString: requiredEnv('DATABASE_URL'),
      // Small per-instance pool: on Vercel many concurrent serverless
      // invocations each hold their own pool, so this should stay small and
      // DATABASE_URL should point at Neon's pooled ("-pooler") connection
      // string — a large max here just defeats the pooler.
      max: 5,
    },
  }),
  sharp,
  plugins: [
    seoPlugin({
      collections: ['products', 'categories'],
      uploadsCollection: 'media',
      generateTitle: ({ doc, collectionConfig }) => {
        const name = collectionConfig?.slug === 'categories' ? doc?.name : doc?.title
        return `${name} | UTSlovakia`
      },
      generateDescription: ({ doc }) => doc?.description ?? '',
    }),
    s3Storage({
      collections: {
        media: {
          disableLocalStorage: true,
          prefix: 'media',
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        region: 'auto',
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
      // No `clientUploads`: with it, the browser PUTs the raw file straight to
      // the bucket and Payload never re-uploads the webp-converted/resized
      // original (plugin-cloud-storage skips files carrying clientUploadContext),
      // so the DB points at e.g. `x.webp` while the bucket only has `x.png`.
      // Server-side uploads keep only compressed webp in R2, at the cost of
      // Vercel's ~4.5MB request-body limit per upload.
    }),
  ],
})
