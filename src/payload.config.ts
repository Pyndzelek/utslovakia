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
import { HomePage } from './globals/HomePage'
import { SITE_URL } from './lib/site'
import { metaDescription } from './lib/seo/meta'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/** Polish help text for the SEO plugin's fields (shown in the product/category "SEO" tab). */
const seoFieldDescriptions: Record<string, string> = {
  title:
    'Tytuł w wynikach Google (ok. 50–60 znaków). Puste = nazwa produktu. „ | UTSlovakia” dodaje się automatycznie.',
  description: 'Opis w wynikach Google (ok. 120–155 znaków). Puste = początek opisu produktu.',
  image: 'Obraz przy udostępnianiu linku (Facebook, WhatsApp). Puste = pierwsze zdjęcie produktu.',
}

/** Fail fast instead of booting with an empty secret / connection string. */
function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

/**
 * R2 credentials: required on Vercel (media must never silently fail to upload), optional
 * elsewhere so CI and local builds without storage access still work.
 */
const storageEnv = (name: string): string =>
  process.env.VERCEL ? requiredEnv(name) : (process.env[name] ?? '')

export default buildConfig({
  // Only accept cookie-authenticated requests from the site's own origins. (No `serverURL`:
  // it would turn media URLs into absolute production URLs, breaking dev/preview images.)
  csrf: [
    SITE_URL,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
    process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`,
    // Local `pnpm dev` *and* `pnpm build && pnpm start` (which runs with NODE_ENV=production):
    // allow localhost everywhere except the live Vercel deployment.
    ...(process.env.VERCEL_ENV === 'production'
      ? []
      : [`http://localhost:${process.env.PORT || 3000}`, 'http://localhost:3000']),
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
      beforeDashboard: ['/components/admin/dashboard-help#DashboardHelp'],
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
  globals: [HomePage, SiteSettings],
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
      // The site's title template appends "| UTSlovakia", so don't add it here.
      generateTitle: ({ doc, collectionConfig }) =>
        (collectionConfig?.slug === 'categories' ? doc?.name : doc?.title) ?? '',
      generateDescription: ({ doc }) => metaDescription(doc?.description) ?? '',
      fields: ({ defaultFields }) =>
        defaultFields.map((field) =>
          'name' in field && field.name in seoFieldDescriptions
            ? {
                ...field,
                admin: { ...field.admin, description: seoFieldDescriptions[field.name] },
              }
            : field,
        ) as typeof defaultFields,
    }),
    s3Storage({
      collections: {
        media: {
          disableLocalStorage: true,
          prefix: 'media',
        },
      },
      bucket: storageEnv('S3_BUCKET'),
      config: {
        region: 'auto',
        endpoint: storageEnv('S3_ENDPOINT') || undefined,
        forcePathStyle: true,
        credentials: {
          accessKeyId: storageEnv('S3_ACCESS_KEY_ID'),
          secretAccessKey: storageEnv('S3_SECRET_ACCESS_KEY'),
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
