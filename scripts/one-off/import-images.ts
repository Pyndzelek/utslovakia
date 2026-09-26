/**
 * One-off: uploads product/category photos from a local folder to Media (R2) and attaches them.
 *
 *   pnpm payload run scripts/one-off/import-images.ts -- <folder> [--dry] [--force]
 *
 * Folder layout (product folders are named by the product's slug, categories by their `en` slug):
 *
 *   <folder>/
 *     products/         ← optional: product folders may also sit directly in <folder>
 *       jcm-uba-10-ss-banknote-validator/
 *         01.jpg        ← first file (sorted by name) becomes the main photo
 *         02.jpg
 *     categories/
 *       bill-acceptors.jpg
 *
 * Any jpg/jpeg/png/webp/avif/heic works. Photos are auto-rotated and shrunk to ≤2400px WebP
 * before upload, so large camera files are fine. A product/category whose photos were already
 * replaced (no longer the `maszynka.png` placeholder) is skipped unless --force is passed,
 * which replaces its photos with the folder's contents.
 */
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '@payload-config'
import { findPlaceholderId, scriptContext, uploadImage } from './lib'

type Locale = 'pl' | 'en' | 'sk' | 'pt-br'
const LOCALES: Locale[] = ['pl', 'en', 'sk', 'pt-br']
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|heic|heif)$/i

const [root, ...flags] = process.argv.slice(2).filter((a) => a !== '--')
const dry = flags.includes('--dry')
const force = flags.includes('--force')
if (!root)
  throw new Error(
    'Usage: payload run scripts/one-off/import-images.ts -- <folder> [--dry] [--force]',
  )

const listImages = (dir: string) =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir)
        .filter((f) => IMAGE_EXT.test(f) && !f.startsWith('.'))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    : []

const payload = await getPayload({ config })

const placeholderId = await findPlaceholderId(payload)
const upload = (file: string, name: string, alt: string) =>
  uploadImage(payload, file, name, alt, dry)

// ---- Products ----
// Product folders may sit directly in <folder> when there's no products/ sub-folder.
const productsDir = fs.existsSync(path.join(root, 'products')) ? path.join(root, 'products') : root
const folders = fs.existsSync(productsDir)
  ? fs
      .readdirSync(productsDir)
      .filter((f) => f !== 'categories' && fs.statSync(path.join(productsDir, f)).isDirectory())
  : []

for (const slug of folders) {
  const files = listImages(path.join(productsDir, slug))
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const product = docs[0]
  if (!product) {
    console.warn(`✗ products/${slug}: no product with this slug — check the folder name`)
    continue
  }
  if (!files.length) continue
  const hasRealPhotos = product.images.some((i) => i.image !== placeholderId)
  if (hasRealPhotos && !force) {
    console.log(`– ${slug}: already has photos, skipping (use --force to replace)`)
    continue
  }

  console.log(`+ ${slug}: ${files.length} photo(s)`)
  const titles = {} as Record<Locale, string>
  for (const locale of LOCALES) {
    const doc = await payload.findByID({ collection: 'products', id: product.id, locale, depth: 0 })
    titles[locale] = doc.title
  }

  const mediaIds: number[] = []
  for (const [i, file] of files.entries()) {
    const n = String(i + 1).padStart(2, '0')
    mediaIds.push(await upload(path.join(productsDir, slug, file), `${slug}-${n}`, titles.pl))
  }
  if (dry) continue

  // New rows are created in the first locale; the others write alt text into the same rows.
  let saved = await payload.update({
    collection: 'products',
    id: product.id,
    locale: LOCALES[0],
    depth: 0,
    context: scriptContext(),
    data: { images: mediaIds.map((image) => ({ image, alt: titles[LOCALES[0]] })) },
  })
  for (const locale of LOCALES.slice(1)) {
    saved = await payload.update({
      collection: 'products',
      id: product.id,
      locale,
      depth: 0,
      context: scriptContext(),
      data: { images: saved.images.map(({ id, image }) => ({ id, image, alt: titles[locale] })) },
    })
  }
}

// ---- Categories ----
const categoriesDir = path.join(root, 'categories')
for (const file of listImages(categoriesDir)) {
  const slug = path.parse(file).name
  const { docs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    locale: 'en',
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const category = docs[0]
  if (!category) {
    console.warn(`✗ categories/${file}: no category with en slug "${slug}"`)
    continue
  }
  if (category.image !== placeholderId && !force) {
    console.log(`– category ${slug}: already has a photo, skipping (use --force to replace)`)
    continue
  }
  console.log(`+ category ${slug}`)
  const pl = await payload.findByID({ collection: 'categories', id: category.id, locale: 'pl' })
  const image = await upload(path.join(categoriesDir, file), `category-${slug}`, pl.name)
  if (dry) continue
  await payload.update({
    collection: 'categories',
    id: category.id,
    data: { image },
    context: scriptContext(),
  })
}

console.log(dry ? '\nDry run — nothing uploaded.' : '\nDone.')
process.exit(0)
