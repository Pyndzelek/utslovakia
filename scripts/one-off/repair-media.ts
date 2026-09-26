/**
 * One-off repair for Media originals missing from R2.
 *
 *   pnpm payload run scripts/one-off/repair-media.ts -- [--dry]
 *
 * While `clientUploads` was enabled, the browser uploaded the raw file (e.g. `esn.png`)
 * straight to the bucket, but the DB recorded the webp-converted name (`esn.webp`) that
 * was never uploaded. For every Media doc whose `media/<filename>` object is missing, this
 * finds the raw original under the same basename, converts it with the same options as
 * `Media.upload` (resize ≤2400px, webp q80), uploads it under the expected key and deletes
 * the raw file. Idempotent: docs whose object already exists are skipped.
 */
import path from 'node:path'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import sharp from 'sharp'
import { getPayload } from 'payload'
import config from '@payload-config'

const PREFIX = 'media'
const SIZE_SUFFIX = /-\d+x\d+\.[^.]+$/
const dry = process.argv.includes('--dry')

const bucket = process.env.S3_BUCKET || ''
const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
})

async function exists(key: string): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return true
  } catch (err) {
    if ((err as { name?: string }).name === 'NotFound') return false
    throw err
  }
}

async function findRawOriginal(filename: string): Promise<string | undefined> {
  const base = path.parse(filename).name
  const { Contents = [] } = await s3.send(
    new ListObjectsV2Command({ Bucket: bucket, Prefix: `${PREFIX}/${base}.` }),
  )
  return Contents.map((obj) => obj.Key!).find((key) => !SIZE_SUFFIX.test(key))
}

const payload = await getPayload({ config })
const { docs } = await payload.find({ collection: 'media', depth: 0, pagination: false })

let repaired = 0
for (const doc of docs) {
  if (!doc.filename) continue
  const key = `${PREFIX}/${doc.filename}`
  if (await exists(key)) continue

  const rawKey = await findRawOriginal(doc.filename)
  if (!rawKey) {
    console.warn(`✗ ${key}: missing and no raw original found — re-upload in admin`)
    continue
  }

  console.log(`${dry ? '[dry] ' : ''}${rawKey} → ${key}`)
  if (dry) continue

  const raw = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: rawKey }))
  const input = Buffer.from(await raw.Body!.transformToByteArray())
  const output = await sharp(input)
    .rotate()
    .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()

  await s3.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: output, ContentType: 'image/webp' }),
  )
  if (rawKey !== key) {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: rawKey }))
  }
  repaired++
}

console.log(`${dry ? '[dry] ' : ''}done — ${repaired} repaired of ${docs.length} media docs`)
process.exit(0)
