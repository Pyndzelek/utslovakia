/**
 * Imports products from the workbook written by `template.ts` (English content).
 *
 *   pnpm payload run scripts/product-sheet/import.ts -- <sheet.xlsx> [--images <dir>] [--dry] [--no-mirror]
 *
 *   --images     folder with the photos named on the Images sheet (searched recursively, file
 *                names matched case-insensitively). Defaults to an `images/` folder next to
 *                the workbook. Not needed when every photo is an https:// link.
 *   --dry        validate everything and print the plan, write nothing.
 *   --no-mirror  don't copy the English text into empty Polish fields (see below).
 *
 * The whole workbook is validated first; on any error nothing is written. Products are matched
 * by SKU (updated if present, created otherwise), brands by name (created if missing),
 * categories by their English name or slug (must already exist). Example rows (SKU
 * `EXAMPLE-…`) are skipped.
 *
 * Text is written to the `en` locale. `pl` is the default locale and has no fallback of its
 * own (`sk`/`pt-br` fall back to it), so empty Polish fields are filled with the English text
 * as a placeholder until translated; Polish text that already exists is left alone. Array rows
 * (photos, key features, variants) keep their ids by position, so translations of unchanged
 * rows survive a re-import.
 *
 * The sheet is the source of truth for the columns it has: an empty optional cell clears that
 * field. Exception: a product with no rows on the Images sheet keeps its current photos (a new
 * product gets the `maszynka.png` placeholder). Photos are de-duplicated by content, so
 * re-running the import doesn't upload them twice.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import ExcelJS from 'exceljs'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import config from '@payload-config'
import type { Product } from '@/payload-types'
import { slugify } from '@/fields/slug'
import {
  findPlaceholderId,
  PLACEHOLDER_MEDIA_FILENAME,
  scriptContext,
  uploadImage,
} from '../one-off/lib'
import {
  BADGE,
  CATEGORY_COUNT,
  CURRENCIES,
  EXAMPLE_SKU_PREFIX,
  FIRST_DATA_ROW,
  HEADER_ROW,
  IMAGE_COLUMNS,
  KEY_FEATURE_COUNT,
  PRODUCT_COLUMNS,
  SHEET,
  STATUS,
  STOCK,
  VARIANT_COLUMNS,
  VARIANT_STOCK,
  type Column,
} from './columns'

const LOCALE = 'en' as const
const MIRROR_LOCALE = 'pl' as const

// ---- CLI ----
const argv = process.argv.slice(2).filter((a) => a !== '--')
const flag = (name: string) => argv.includes(name)
const option = (name: string) => {
  const i = argv.indexOf(name)
  return i === -1 ? undefined : argv[i + 1]
}
const workbookPath = argv.find((a, i) => !a.startsWith('--') && argv[i - 1] !== '--images')
const dry = flag('--dry')
const mirror = !flag('--no-mirror')
if (!workbookPath)
  throw new Error(
    'Usage: payload run scripts/product-sheet/import.ts -- <sheet.xlsx> [--images <dir>] [--dry] [--no-mirror]',
  )
const imagesDir = option('--images') ?? path.join(path.dirname(workbookPath), 'images')

// ---- Reading cells ----
const errors: string[] = []
const warnings: string[] = []

/** Any ExcelJS cell value (rich text, hyperlink, formula, date…) as trimmed text. */
function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'object') {
    if ('richText' in value)
      return value.richText
        .map((t) => t.text)
        .join('')
        .trim()
    if ('hyperlink' in value) return cellText(value.hyperlink || value.text)
    if ('result' in value) return cellText(value.result as ExcelJS.CellValue)
    if ('error' in value) return ''
  }
  return String(value).trim()
}

type Row = { at: string; get: (key: string) => string }

/** Rows of a data sheet as key → text, located by header text (column order doesn't matter). */
function readSheet(wb: ExcelJS.Workbook, name: string, columns: Column[]): Row[] {
  const ws = wb.getWorksheet(name)
  if (!ws) {
    errors.push(`Sheet "${name}" is missing`)
    return []
  }
  const byHeader = new Map(columns.map((c) => [c.header.toLowerCase(), c]))
  const index = new Map<string, number>()
  ws.getRow(HEADER_ROW).eachCell((cell, n) => {
    const column = byHeader.get(cellText(cell.value).toLowerCase())
    if (column) index.set(column.key, n)
  })
  for (const c of columns)
    if (!index.has(c.key))
      (c.required ? errors : warnings).push(`${name}: column "${c.header}" is missing`)

  const rows: Row[] = []
  for (let r = FIRST_DATA_ROW; r <= ws.rowCount; r++) {
    const row = ws.getRow(r)
    const get = (key: string) => {
      const n = index.get(key)
      // Normalize Windows line breaks from Alt+Enter / pasted text.
      return n ? cellText(row.getCell(n).value).replace(/\r\n?/g, '\n') : ''
    }
    if (columns.every((c) => !get(c.key))) continue
    if (get('sku').toUpperCase().startsWith(EXAMPLE_SKU_PREFIX)) continue
    rows.push({ at: `${name} row ${r}`, get })
  }
  return rows
}

function parseNumber(row: Row, key: string, header: string, opts: { integer?: boolean } = {}) {
  const raw = row.get(key)
  if (!raw) return null
  // Tolerate "1 299,99", "1,299.99", "PLN 1299" and similar.
  let s = raw.replace(/[^\d.,-]/g, '')
  if (s.includes(',') && s.includes('.'))
    s = s.replace(s.lastIndexOf(',') > s.lastIndexOf('.') ? /\./g : /,/g, '')
  s = s.replace(',', '.')
  const n = Number(s)
  if (!s || !Number.isFinite(n) || n < 0 || (opts.integer && !Number.isInteger(n))) {
    errors.push(
      `${row.at}: "${header}" must be a ${opts.integer ? 'whole ' : ''}number ≥ 0, got "${raw}"`,
    )
    return null
  }
  return n
}

function parseChoice<T>(
  row: Row,
  key: string,
  header: string,
  choices: Record<string, T>,
  fallback: T,
) {
  const raw = row.get(key)
  if (!raw) return fallback
  const norm = (s: string) => s.toLowerCase().replace(/[\s_-]+/g, '')
  for (const [label, value] of Object.entries(choices))
    if (norm(label) === norm(raw) || norm(String(value)) === norm(raw)) return value
  errors.push(
    `${row.at}: "${header}" must be one of ${Object.keys(choices).join(', ')}, got "${raw}"`,
  )
  return fallback
}

// ---- Photos ----
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|heic|heif|tiff?)$/i

/** Lowercased file name / relative path → absolute path, for every image under imagesDir. */
const imageFiles = new Map<string, string>()
const ambiguous = new Set<string>()
function indexImages(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === '__MACOSX') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) indexImages(full)
    else if (IMAGE_EXT.test(entry.name)) {
      const name = entry.name.toLowerCase()
      if (imageFiles.has(name)) ambiguous.add(name)
      imageFiles.set(name, full)
      imageFiles.set(path.relative(imagesDir, full).split(path.sep).join('/').toLowerCase(), full)
    }
  }
}
if (fs.existsSync(imagesDir)) indexImages(imagesDir)

type ImageSource = { kind: 'url'; url: string } | { kind: 'file'; file: string }

function resolveImage(at: string, raw: string): ImageSource | undefined {
  if (/^https?:\/\//i.test(raw)) {
    if (/drive\.google\.com|dropbox\.com\/s\/|1drv\.ms|onedrive\.live/i.test(raw))
      warnings.push(`${at}: "${raw}" looks like a sharing page, not a direct image link`)
    return { kind: 'url', url: raw }
  }
  const key = raw
    .replace(/\\/g, '/')
    .replace(/^\.?\//, '')
    .toLowerCase()
  const file = imageFiles.get(key)
  if (!file) {
    errors.push(
      fs.existsSync(imagesDir)
        ? `${at}: photo "${raw}" not found in ${imagesDir}`
        : `${at}: photo "${raw}" given but images folder ${imagesDir} doesn't exist (pass --images <dir>)`,
    )
    return undefined
  }
  if (ambiguous.has(key))
    errors.push(`${at}: several files named "${raw}" in ${imagesDir} — use the sub-folder path`)
  return { kind: 'file', file }
}

const sourceKey = (s: ImageSource) => (s.kind === 'url' ? s.url : s.file)

// ---- Parse + validate the workbook ----
type ParsedProduct = {
  at: string
  sku: string
  slug: string
  brandName?: string
  categoryNames: string[]
  images: { source: ImageSource; alt: string }[]
  seoImage?: ImageSource
  variants: NonNullable<Product['variants']>
  data: Omit<
    RequiredDataFromCollectionSlug<'products'>,
    'brand' | 'categories' | 'images' | 'variants' | 'meta'
  > & { meta: { title: string | null; description: string | null } }
}

const wb = new ExcelJS.Workbook()
await wb.xlsx.readFile(workbookPath)

const productRows = readSheet(wb, SHEET.products, PRODUCT_COLUMNS)
const imageRows = readSheet(wb, SHEET.images, IMAGE_COLUMNS)
const variantRows = readSheet(wb, SHEET.variants, VARIANT_COLUMNS)
const header = (columns: Column[], key: string) => columns.find((c) => c.key === key)!.header

const products = new Map<string, ParsedProduct>()
const slugs = new Map<string, string>()

for (const row of productRows) {
  const h = (key: string) => header(PRODUCT_COLUMNS, key)
  const sku = row.get('sku')
  const title = row.get('title').replace(/\s+/g, ' ')
  const description = row.get('description')
  for (const key of ['sku', 'title', 'description', 'category1', 'pricePLN'])
    if (!row.get(key)) errors.push(`${row.at}: "${h(key)}" is required`)
  if (!sku) continue
  if (products.has(sku)) {
    errors.push(`${row.at}: SKU "${sku}" appears twice (also ${products.get(sku)!.at})`)
    continue
  }

  const slug = slugify(row.get('slug') || title)
  if (title && !slug)
    errors.push(`${row.at}: can't build a URL slug from "${title}" — fill "${h('slug')}"`)
  if (slug && slugs.has(slug))
    errors.push(
      `${row.at}: URL slug "${slug}" is the same as ${slugs.get(slug)} — fill "${h('slug')}"`,
    )
  slugs.set(slug, row.at)

  const link = row.get('link')
  if (link) {
    let ok = false
    try {
      ok = new URL(link).protocol === 'https:'
    } catch {}
    if (!ok) errors.push(`${row.at}: "${h('link')}" must be a full https:// link, got "${link}"`)
  }

  const prices = Object.fromEntries(
    CURRENCIES.map((c) => [c, parseNumber(row, `price${c}`, h(`price${c}`))]),
  ) as ParsedProduct['data']['prices']
  const seoImageRaw = row.get('seoImage')

  products.set(sku, {
    at: row.at,
    sku,
    slug,
    brandName: row.get('brand') || undefined,
    categoryNames: [
      ...new Set(
        Array.from({ length: CATEGORY_COUNT }, (_, i) => row.get(`category${i + 1}`)).filter(
          Boolean,
        ),
      ),
    ],
    images: [],
    seoImage: seoImageRaw ? resolveImage(row.at, seoImageRaw) : undefined,
    variants: [],
    data: {
      sku,
      slug,
      title,
      description,
      status: parseChoice(row, 'status', h('status'), STATUS, 'published'),
      stockStatus: parseChoice(row, 'stockStatus', h('stockStatus'), STOCK, 'in_stock'),
      badge: parseChoice<Product['badge']>(row, 'badge', h('badge'), BADGE, null),
      link: link || null,
      warranty: parseNumber(row, 'warranty', h('warranty'), { integer: true }),
      prices,
      keyFeatures: Array.from({ length: KEY_FEATURE_COUNT }, (_, i) => row.get(`feature${i + 1}`))
        .filter(Boolean)
        .map((text) => ({ text })),
      meta: {
        title: row.get('seoTitle') || null,
        description: row.get('seoDescription') || null,
      },
    },
  })
}

for (const row of imageRows) {
  const sku = row.get('sku')
  const product = products.get(sku)
  if (!product) {
    errors.push(`${row.at}: SKU "${sku}" is not on the ${SHEET.products} sheet`)
    continue
  }
  const raw = row.get('image')
  if (!raw) {
    errors.push(`${row.at}: "${header(IMAGE_COLUMNS, 'image')}" is required`)
    continue
  }
  const source = resolveImage(row.at, raw)
  if (source) product.images.push({ source, alt: row.get('alt') })
}

for (const row of variantRows) {
  const h = (key: string) => header(VARIANT_COLUMNS, key)
  const sku = row.get('sku')
  const product = products.get(sku)
  if (!product) {
    errors.push(`${row.at}: SKU "${sku}" is not on the ${SHEET.products} sheet`)
    continue
  }
  const modelName = row.get('modelName')
  if (!modelName) errors.push(`${row.at}: "${h('modelName')}" is required`)
  product.variants.push({
    modelName,
    sku: row.get('variantSku') || null,
    stockStatus: parseChoice(row, 'stockStatus', h('stockStatus'), VARIANT_STOCK, 'inherit'),
    priceOverrides: Object.fromEntries(
      CURRENCIES.map((c) => [c, parseNumber(row, `price${c}`, h(`price${c}`))]),
    ),
  })
}

if (!products.size && !errors.length)
  errors.push(`No products found on the ${SHEET.products} sheet`)

// ---- Validate against the database ----
const payload = await getPayload({ config })

const existing = new Map<string, Product>()
for (const sku of products.keys()) {
  const { docs } = await payload.find({
    collection: 'products',
    where: { sku: { equals: sku } },
    locale: LOCALE,
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  if (docs[0]) existing.set(sku, docs[0])
}

for (const p of products.values()) {
  if (!p.slug) continue
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: p.slug } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const other = docs[0]
  if (other && other.sku !== p.sku)
    errors.push(
      `${p.at}: URL slug "${p.slug}" is already used by product ${other.sku ?? `#${other.id}`} — fill "URL slug"`,
    )
}

// Categories: matched by English name or slug, case-insensitively (hidden ones too).
const categoryIndex = new Map<string, number>()
const { docs: categories } = await payload.find({
  collection: 'categories',
  locale: LOCALE,
  depth: 0,
  limit: 0,
  overrideAccess: true,
})
for (const c of categories) {
  if (c.name) categoryIndex.set(c.name.trim().toLowerCase(), c.id)
  if (c.slug) categoryIndex.set(c.slug.toLowerCase(), c.id)
}
for (const p of products.values())
  for (const name of p.categoryNames)
    if (!categoryIndex.has(name.toLowerCase()))
      errors.push(`${p.at}: unknown category "${name}" — create it in the admin panel first`)

const { docs: brands } = await payload.find({ collection: 'brands', depth: 0, limit: 0 })
const brandIndex = new Map(brands.map((b) => [b.name.trim().toLowerCase(), b.id]))

const needsPlaceholder = [...products.values()].some(
  (p) => !p.images.length && !existing.has(p.sku),
)
const placeholderId = needsPlaceholder ? await findPlaceholderId(payload) : undefined
if (needsPlaceholder && !placeholderId)
  errors.push(
    `Some new products have no photos and placeholder "${PLACEHOLDER_MEDIA_FILENAME}" isn't in Media`,
  )

for (const w of warnings) console.warn(`⚠ ${w}`)
if (errors.length) {
  console.error(`\n✗ ${errors.length} problem(s) — nothing was imported:\n`)
  for (const e of errors) console.error(`  • ${e}`)
  process.exit(1)
}

// ---- Write ----
const mediaIds = new Map<string, number>()

async function readSource(source: ImageSource): Promise<Buffer> {
  if (source.kind === 'file') return fs.promises.readFile(source.file)
  const res = await fetch(source.url)
  if (!res.ok) throw new Error(`GET ${source.url} → HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

/** Uploads a photo once; the file name carries a content hash so re-runs reuse the Media doc. */
async function mediaFor(source: ImageSource, sku: string, alt: string): Promise<number> {
  const key = sourceKey(source)
  const cached = mediaIds.get(key)
  if (cached) return cached
  const data = await readSource(source)
  const name = `${slugify(sku)}-${crypto.createHash('sha1').update(data).digest('hex').slice(0, 10)}`
  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { equals: `${name}.webp` } },
    depth: 0,
    limit: 1,
  })
  const id = docs[0]?.id ?? (await uploadImage(payload, data, name, alt, dry))
  if (docs[0]) console.log(`    = ${name}.webp (already uploaded)`)
  mediaIds.set(key, id)
  return id
}

async function brandFor(name: string | undefined): Promise<number | null> {
  if (!name) return null
  const key = name.toLowerCase()
  const known = brandIndex.get(key)
  if (known) return known
  console.log(`  + brand "${name}"`)
  const id = dry
    ? -1
    : (await payload.create({ collection: 'brands', data: { name }, context: scriptContext() })).id
  brandIndex.set(key, id)
  return id
}

/** Reuses the existing row ids by position, so other locales' text stays attached. */
const withIds = <T extends object>(rows: T[], current?: { id?: string | null }[] | null) =>
  rows.map((row, i) => (current?.[i]?.id ? { ...row, id: current[i].id } : row))

/** Fills empty `pl` fields with the saved English text; existing Polish text is kept. */
async function mirrorToPolish(saved: Product) {
  const pl = await payload.findByID({
    collection: 'products',
    id: saved.id,
    locale: MIRROR_LOCALE,
    fallbackLocale: false,
    depth: 0,
    overrideAccess: true,
  })
  const pick = <T>(plValue: T | null | undefined, enValue: T) => (plValue ? plValue : enValue)
  const idOf = (v: unknown) => (v && typeof v === 'object' && 'id' in v ? (v.id as number) : v)
  const data = {
    title: pick(pl.title, saved.title),
    description: pick(pl.description, saved.description),
    images: saved.images.map((img, i) => ({
      id: img.id,
      image: idOf(img.image) as number,
      alt: pick(pl.images?.[i]?.alt, img.alt ?? null),
    })),
    keyFeatures: saved.keyFeatures?.map((f, i) => ({
      id: f.id,
      text: pick(pl.keyFeatures?.[i]?.text, f.text),
    })),
    variants: saved.variants?.map((v, i) => ({
      ...v,
      modelName: pick(pl.variants?.[i]?.modelName, v.modelName),
    })),
    meta: {
      title: pick(pl.meta?.title, saved.meta?.title ?? null),
      description: pick(pl.meta?.description, saved.meta?.description ?? null),
      image: (idOf(pick(pl.meta?.image, saved.meta?.image ?? null)) as number | null) ?? null,
    },
  }
  const unchanged =
    data.title === pl.title &&
    data.description === pl.description &&
    data.images.every((img, i) => img.alt === (pl.images?.[i]?.alt ?? null)) &&
    (data.keyFeatures ?? []).every((f, i) => f.text === pl.keyFeatures?.[i]?.text) &&
    (data.variants ?? []).every((v, i) => v.modelName === pl.variants?.[i]?.modelName) &&
    data.meta.title === (pl.meta?.title ?? null) &&
    data.meta.description === (pl.meta?.description ?? null) &&
    data.meta.image === ((idOf(pl.meta?.image) as number | null | undefined) ?? null)
  if (unchanged) return
  await payload.update({
    collection: 'products',
    id: saved.id,
    locale: MIRROR_LOCALE,
    data,
    depth: 0,
    overrideAccess: true,
    context: scriptContext(),
  })
  console.log(`    ↳ filled empty Polish fields with English text`)
}

let failed = 0
for (const p of products.values()) {
  const current = existing.get(p.sku)
  console.log(`${current ? '~ update' : '+ create'} ${p.sku} → /${p.slug}`)
  try {
    const images = p.images.length
      ? await Promise.all(
          p.images.map(async ({ source, alt }) => ({
            image: await mediaFor(source, p.sku, alt || p.data.title),
            alt: alt || null,
          })),
        )
      : current
        ? current.images.map(({ image, alt }) => ({
            image: typeof image === 'object' ? image.id : image,
            alt,
          }))
        : [{ image: placeholderId!, alt: null }]
    const seoImage = p.seoImage ? await mediaFor(p.seoImage, p.sku, p.data.title) : null

    const data: RequiredDataFromCollectionSlug<'products'> = {
      ...p.data,
      brand: await brandFor(p.brandName),
      categories: p.categoryNames.map((name) => categoryIndex.get(name.toLowerCase())!),
      images: withIds(images, current?.images),
      keyFeatures: withIds(p.data.keyFeatures ?? [], current?.keyFeatures),
      variants: withIds(p.variants, current?.variants),
      meta: { ...p.data.meta, image: seoImage },
    }
    console.log(
      `    ${images.length} photo(s), ${data.keyFeatures?.length ?? 0} key feature(s), ${p.variants.length} variant(s)` +
        (p.images.length || !current ? '' : ' — photos kept'),
    )
    if (dry) continue

    const saved = current
      ? await payload.update({
          collection: 'products',
          id: current.id,
          locale: LOCALE,
          data,
          depth: 0,
          overrideAccess: true,
          context: scriptContext(),
        })
      : await payload.create({
          collection: 'products',
          locale: LOCALE,
          data,
          depth: 0,
          overrideAccess: true,
          context: scriptContext(),
        })
    if (mirror) await mirrorToPolish(saved)
  } catch (err) {
    failed++
    console.error(`  ✗ ${p.sku}: ${err instanceof Error ? err.message : String(err)}`)
  }
}

console.log(
  dry
    ? `\nDry run — ${products.size} product(s) validated, nothing written.`
    : `\nDone — ${products.size - failed} of ${products.size} product(s) imported.` +
        (failed ? ` ${failed} failed (see above); fix them and re-run — it's safe to repeat.` : ''),
)
console.log(
  'Revalidation hooks were skipped: redeploy or re-save a product to refresh cached pages.',
)
process.exit(failed ? 1 : 0)
