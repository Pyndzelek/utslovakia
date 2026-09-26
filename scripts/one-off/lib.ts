/** Helpers shared by the one-off import scripts (run through `pnpm payload run`). */
import sharp from 'sharp'
import type { Payload } from 'payload'

/**
 * `context` for Local API writes: skips the revalidation hooks, which need a Next.js request
 * context a CLI script doesn't have. Always pass a fresh object — Payload writes into it
 * (the cloud-storage plugin leaves `skipCloudStorage: true` behind), so a shared one makes
 * every upload after the first silently skip R2.
 */
export const scriptContext = () => ({ disableRevalidate: true })

/** Media doc attached to imported products/categories that have no photo yet. */
export const PLACEHOLDER_MEDIA_FILENAME = 'maszynka.png'

export async function findPlaceholderId(payload: Payload): Promise<number | undefined> {
  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { equals: PLACEHOLDER_MEDIA_FILENAME } },
    limit: 1,
  })
  return docs[0]?.id
}

/**
 * Auto-rotates and shrinks a photo to ≤2400px WebP (so it stays under the Media collection's
 * 4 MB upload limit), then uploads it. Returns the Media id, or -1 on a dry run.
 */
export async function uploadImage(
  payload: Payload,
  input: string | Buffer,
  name: string,
  alt: string,
  dry = false,
): Promise<number> {
  const data = await sharp(input)
    .rotate()
    .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer()
  console.log(`    ↑ ${name}.webp (${(data.length / 1024).toFixed(0)} KB)`)
  if (dry) return -1
  const media = await payload.create({
    collection: 'media',
    data: { alt },
    file: { data, name: `${name}.webp`, mimetype: 'image/webp', size: data.length },
    context: scriptContext(),
  })
  return media.id
}

// Brand spellings seen in the source data → canonical brand name.
export const BRAND_MAP: Record<string, string> = {
  JCM: 'JCM Global',
  'JCM Global': 'JCM Global',
  TransAct: 'TransAct Technologies',
  'TransAct Technologies Incorporated': 'TransAct Technologies',
  'CRANE- CPI': 'Crane Payment Innovations (CPI)',
  'Crane Payment Innovations (CPI).': 'Crane Payment Innovations (CPI)',
  'Innovative Technology Ltd.': 'Innovative Technology Ltd.',
  'DATA MODUL -NOVOMATIC': 'DATA MODUL',
  NOVOMATIC: 'Novomatic',
  SUZOHAPP: 'SUZOHAPP',
  'Elo Touch Solutions': 'Elo Touch Solutions',
}
