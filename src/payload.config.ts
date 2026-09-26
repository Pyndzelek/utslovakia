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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
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
  collections: [Users, Media, Category, Product, Brand],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
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
      // Uploads go straight from the admin's browser to the bucket, bypassing
      // Vercel's ~4.5MB serverless function request-body limit.
      clientUploads: true,
    }),
  ],
})
