/**
 * Imports products from one sheet (Google Sheets → File → Download → CSV), English content.
 *
 *   pnpm payload run scripts/product-sheet/import.ts -- <products.csv> --photos <dir> [--dry] [--no-mirror]
 *
 *   --photos     folder with one sub-folder per product, named exactly like its SKU:
 *                  photos/UBA-10/01.jpg, photos/UBA-10/02.jpg, …
 *                Files are sorted by name; the first one is the main photo.
 *   --dry        validate everything and print the plan, write nothing.
 *   --no-mirror  don't copy the English text into empty Polish fields (see below).
 *
 * Columns (header row, any order; * = required on a product's first row):
 *   sku*, title*, description*, categories* (several separated by ";"), brand,
 *   key_features (one per line), price_pln*, price_eur, price_usd, price_brl,
 *   warranty_months, stock_status, badge, ebay_link, status, slug, seo_title,
 *   seo_description, variant_name, variant_sku, variant_stock_status,
 *   variant_price_pln, variant_price_eur, variant_price_usd, variant_price_brl
 *
 * One row per product. A product with variants takes one row per variant: repeat the SKU
 * and fill only the variant_* columns on the extra rows (product columns are read from the
 * first row with that SKU).
 *
 * The whole sheet is validated first; on any error nothing is written. Products are matched
 * by SKU (updated if present, created otherwise), brands by name (created if missing),
 * categories by name or slug in any language (must already exist in the CMS — they need a
 * photo). A product without a photo folder keeps its current photos; a new one gets the
 * `maszynka.png` placeholder. Photos are de-duplicated by content, so re-running is safe.
 *
 * Text is written to the `en` locale. `pl` is the default locale and has no fallback of its
 * own (`sk`/`pt-br` fall back to it), so empty Polish fields are filled with the English text
 * as a placeholder until translated; existing Polish text is left alone. Array rows (photos,
 * key features, variants) keep their ids by position, so translations survive a re-import.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
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

const LOCALES = ['pl', 'en', 'sk', 'pt-br'] as const
const LOCALE = 'en' as const
const MIRROR_LOCALE = 'pl' as const
const CURRENCIES = ['PLN', 'EUR', 'USD', 'BRL'] as const
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif|heic|heif|tiff?)$/i

const STATUS = ['published', 'draft', 'archived'] as const
const STOCK = ['in_stock', 'out_of_stock', 'preorder'] as const
const VARIANT_STOCK = ['inherit', ...STOCK] as const
const BADGE = ['new', 'bestseller'] as const

// ---- CLI ----
const argv = process.argv.slice(2).filter((a) => a !== '--')
const option = (name: string) => {
  const i = argv.indexOf(name)
  return i === -1 ? undefined : argv[i + 1]
}
const csvPath = argv.find((a, i) => !a.startsWith('--') && argv[i - 1] !== '--photos')
const photosDir = option('--photos')
const dry = argv.includes('--dry')
const mirror = !argv.includes('--no-mirror')
if (!csvPath)
  throw new Error(
    'Usage: payload run scripts/product-sheet/import.ts -- <products.csv> --photos <dir> [--dry] [--no-mirror]',
  )

const errors: string[] = []
const warnings: string[] = []

// ---- CSV ----
// Minimal RFC 4180 parser (quoted fields, embedded newlines, "" escapes).
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += c
  }
  if (field || row.length) rows.push([...row, field])
  return rows
}

type Row = { at: string; get: (column: string) => string }

const [headerRow = [], ...dataRows] = parseCsv(fs.readFileSync(csvPath, 'utf8').replace(/^﻿/, ''))
// Tolerates decorated headers such as "sku*" (required markers) or "Price PLN".
const headers = headerRow.map((h) =>
  h
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, ''),
)
const KNOWN = [
  'sku',
  'title',
  'description',
  'categories',
  'brand',
  'key_features',
  ...CURRENCIES.map((c) => `price_${c.toLowerCase()}`),
  'warranty_months',
  'stock_status',
  'badge',
  'ebay_link',
  'status',
  'slug',
  'seo_title',
  'seo_description',
  'variant_name',
  'variant_sku',
  'variant_stock_status',
  ...CURRENCIES.map((c) => `variant_price_${c.toLowerCase()}`),
]
for (const required of ['sku', 'title', 'description', 'categories', 'price_pln'])
  if (!headers.includes(required)) errors.push(`Column "${required}" is missing`)
for (const h of headers) if (h && !KNOWN.includes(h)) warnings.push(`Unknown column "${h}" ignored`)

const rows: Row[] = dataRows
  .map((cells, i) => ({
    at: `row ${i + 2}`,
    get: (column: string) => {
      const n = headers.indexOf(column)
      return n === -1 ? '' : (cells[n] ?? '').replace(/\r\n?/g, '\n').trim()
    },
  }))
  .filter((row) => KNOWN.some((c) => row.get(c)))

// ---- Cell parsing ----
function parseNumber(row: Row, column: string, opts: { integer?: boolean } = {}) {
  const raw = row.get(column)
  if (!raw) return null
  // Tolerate "1 299,99", "1,299.99", "PLN 1299" and similar.
  let s = raw.replace(/[^\d.,-]/g, '')
  if (s.includes(',') && s.includes('.'))
    s = s.replace(s.lastIndexOf(',') > s.lastIndexOf('.') ? /\./g : /,/g, '')
  s = s.replace(',', '.')
  const n = Number(s)
  if (!s || !Number.isFinite(n) || n < 0 || (opts.integer && !Number.isInteger(n))) {
    errors.push(
      `${row.at}: "${column}" must be a ${opts.integer ? 'whole ' : ''}number ≥ 0, got "${raw}"`,
    )
    return null
  }
  return n
}

function parseChoice<T extends string>(row: Row, column: string, choices: readonly T[]) {
  const raw = row.get(column)
  if (!raw) return undefined
  const norm = (s: string) => s.toLowerCase().replace(/[\s_-]+/g, '')
  const match = choices.find((c) => norm(c) === norm(raw))
  if (!match)
    errors.push(`${row.at}: "${column}" must be one of ${choices.join(', ')}, got "${raw}"`)
  return match
}

const prices = (row: Row, prefix: string) =>
  Object.fromEntries(CURRENCIES.map((c) => [c, parseNumber(row, `${prefix}${c.toLowerCase()}`)]))

// ---- Parse + validate rows ----
type ParsedProduct = {
  at: string
  sku: string
  slug: string
  brandName?: string
  categoryNames: string[]
  variants: NonNullable<Product['variants']>
  data: Omit<
    RequiredDataFromCollectionSlug<'products'>,
    'brand' | 'categories' | 'images' | 'variants'
  >
}

const products = new Map<string, ParsedProduct>()
const slugs = new Map<string, string>()

for (const row of rows) {
  const sku = row.get('sku')
  if (!sku) {
    errors.push(`${row.at}: "sku" is required`)
    continue
  }

  let product = products.get(sku)
  if (!product) {
    const title = row.get('title').replace(/\s+/g, ' ')
    for (const column of ['title', 'description', 'categories', 'price_pln'])
      if (!row.get(column)) errors.push(`${row.at}: "${column}" is required`)

    const slug = slugify(row.get('slug') || title)
    if (title && !slug)
      errors.push(`${row.at}: can't build a URL slug from "${title}" — fill "slug"`)
    if (slug && slugs.has(slug))
      errors.push(`${row.at}: slug "${slug}" is the same as on ${slugs.get(slug)} — fill "slug"`)
    slugs.set(slug, row.at)

    const link = row.get('ebay_link')
    if (link) {
      let ok = false
      try {
        ok = new URL(link).protocol === 'https:'
      } catch {}
      if (!ok) errors.push(`${row.at}: "ebay_link" must be a full https:// link, got "${link}"`)
    }

    product = {
      at: row.at,
      sku,
      slug,
      brandName: row.get('brand') || undefined,
      categoryNames: [
        ...new Set(
          row
            .get('categories')
            .split(/[;\n]/)
            .map((c) => c.trim())
            .filter(Boolean),
        ),
      ],
      variants: [],
      data: {
        sku,
        slug,
        title,
        description: row.get('description'),
        status: parseChoice(row, 'status', STATUS) ?? 'published',
        stockStatus: parseChoice(row, 'stock_status', STOCK) ?? 'in_stock',
        badge: parseChoice(row, 'badge', BADGE) ?? null,
        link: link || null,
        warranty: parseNumber(row, 'warranty_months', { integer: true }),
        prices: prices(row, 'price_') as ParsedProduct['data']['prices'],
        keyFeatures: row
          .get('key_features')
          .split('\n')
          .map((text) => text.replace(/^[\s•\-*]+/, '').trim())
          .filter(Boolean)
          .map((text) => ({ text })),
        meta: {
          title: row.get('seo_title') || null,
          description: row.get('seo_description') || null,
        },
      },
    }
    products.set(sku, product)
  }

  const variantFields = ['variant_name', 'variant_sku', 'variant_stock_status'].concat(
    CURRENCIES.map((c) => `variant_price_${c.toLowerCase()}`),
  )
  if (variantFields.some((c) => row.get(c))) {
    const modelName = row.get('variant_name')
    if (!modelName) errors.push(`${row.at}: "variant_name" is required when a variant is filled`)
    product.variants.push({
      modelName,
      sku: row.get('variant_sku') || null,
      stockStatus: parseChoice(row, 'variant_stock_status', VARIANT_STOCK) ?? 'inherit',
      priceOverrides: prices(row, 'variant_price_'),
    })
  }
}

if (!products.size && !errors.length) errors.push('No products found in the sheet')

// ---- Photos: <photosDir>/<SKU>/* ----
/** Lowercased folder name → its sorted image files. */
const photoFolders = new Map<string, string[]>()
if (photosDir) {
  if (!fs.existsSync(photosDir)) errors.push(`Photos folder ${photosDir} doesn't exist`)
  else
    for (const entry of fs.readdirSync(photosDir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === '__MACOSX') continue
      const dir = path.join(photosDir, entry.name)
      const files = fs
        .readdirSync(dir)
        .filter((f) => IMAGE_EXT.test(f) && !f.startsWith('.'))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((f) => path.join(dir, f))
      photoFolders.set(entry.name.trim().toLowerCase(), files)
    }
  for (const name of photoFolders.keys())
    if (![...products.keys()].some((sku) => sku.toLowerCase() === name))
      warnings.push(`Photo folder "${name}" doesn't match any SKU in the sheet — ignored`)
}
const photosFor = (sku: string) => photoFolders.get(sku.toLowerCase()) ?? []

// ---- Validate against the database ----
const payload = await getPayload({ config })

const existing = new Map<string, Product>()
for (const p of products.values()) {
  const { docs } = await payload.find({
    collection: 'products',
    where: { sku: { equals: p.sku } },
    locale: LOCALE,
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  if (docs[0]) existing.set(p.sku, docs[0])

  if (!p.slug) continue
  const { docs: sameSlug } = await payload.find({
    collection: 'products',
    where: { slug: { equals: p.slug } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  const other = sameSlug[0]
  if (other && other.sku !== p.sku)
    errors.push(
      `${p.at}: slug "${p.slug}" is already used by product ${other.sku ?? `#${other.id}`} — fill "slug"`,
    )
}

// Categories are usually created in the admin panel in Polish, so match a name or slug in any
// language, case-insensitively (hidden categories too).
const categoryIndex = new Map<string, Set<number>>()
for (const locale of LOCALES) {
  const { docs } = await payload.find({
    collection: 'categories',
    locale,
    fallbackLocale: false,
    depth: 0,
    limit: 0,
    overrideAccess: true,
  })
  for (const c of docs)
    for (const key of [c.name, c.slug])
      if (key) {
        const k = key.trim().toLowerCase()
        categoryIndex.set(k, (categoryIndex.get(k) ?? new Set()).add(c.id))
      }
}
const categoryId = (name: string) => [...(categoryIndex.get(name.toLowerCase()) ?? [])]
for (const p of products.values())
  for (const name of p.categoryNames) {
    const ids = categoryId(name)
    if (!ids.length) errors.push(`${p.at}: unknown category "${name}" — create it in the CMS first`)
    else if (ids.length > 1)
      errors.push(`${p.at}: category "${name}" matches several categories — use its slug instead`)
  }

const { docs: brands } = await payload.find({ collection: 'brands', depth: 0, limit: 0 })
const brandIndex = new Map(brands.map((b) => [b.name.trim().toLowerCase(), b.id]))

const needsPlaceholder = [...products.values()].some(
  (p) => !photosFor(p.sku).length && !existing.has(p.sku),
)
const placeholderId = needsPlaceholder ? await findPlaceholderId(payload) : undefined
for (const p of products.values())
  if (!photosFor(p.sku).length && !existing.has(p.sku))
    warnings.push(`${p.at}: no photo folder "${p.sku}" — new product gets the placeholder photo`)
if (needsPlaceholder && !placeholderId)
  errors.push(`Placeholder photo "${PLACEHOLDER_MEDIA_FILENAME}" isn't in Media`)

for (const w of warnings) console.warn(`⚠ ${w}`)
if (errors.length) {
  console.error(`\n✗ ${errors.length} problem(s) — nothing was imported:\n`)
  for (const e of errors) console.error(`  • ${e}`)
  process.exit(1)
}

// ---- Write ----
/** Uploads a photo once; the file name carries a content hash so re-runs reuse the Media doc. */
async function mediaFor(file: string, sku: string, alt: string): Promise<number> {
  const data = await fs.promises.readFile(file)
  const name = `${slugify(sku)}-${crypto.createHash('sha1').update(data).digest('hex').slice(0, 10)}`
  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { equals: `${name}.webp` } },
    depth: 0,
    limit: 1,
  })
  if (docs[0]) {
    console.log(`    = ${name}.webp (already uploaded)`)
    return docs[0].id
  }
  return uploadImage(payload, data, name, alt, dry)
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

const idOf = (v: unknown) => (v && typeof v === 'object' && 'id' in v ? (v.id as number) : v)

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
    },
  }
  const unchanged =
    data.title === pl.title &&
    data.description === pl.description &&
    data.images.every((img, i) => img.alt === (pl.images?.[i]?.alt ?? null)) &&
    (data.keyFeatures ?? []).every((f, i) => f.text === pl.keyFeatures?.[i]?.text) &&
    (data.variants ?? []).every((v, i) => v.modelName === pl.variants?.[i]?.modelName) &&
    data.meta.title === (pl.meta?.title ?? null) &&
    data.meta.description === (pl.meta?.description ?? null)
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
  const files = photosFor(p.sku)
  console.log(`${current ? '~ update' : '+ create'} ${p.sku} → /${p.slug}`)
  try {
    // One at a time: parallel uploads race on Payload's unique-filename check and get
    // renamed (`-1.webp`), which defeats the already-uploaded lookup on the next run.
    const uploaded: { image: number; alt: null }[] = []
    for (const file of files)
      uploaded.push({ image: await mediaFor(file, p.sku, p.data.title), alt: null })
    const images = uploaded.length
      ? uploaded
      : current
        ? current.images.map(({ image, alt }) => ({ image: idOf(image) as number, alt }))
        : [{ image: placeholderId!, alt: null }]

    const data: RequiredDataFromCollectionSlug<'products'> = {
      ...p.data,
      brand: await brandFor(p.brandName),
      categories: p.categoryNames.map((name) => categoryId(name)[0]),
      images: withIds(images, current?.images),
      keyFeatures: withIds(p.data.keyFeatures ?? [], current?.keyFeatures),
      variants: withIds(p.variants, current?.variants),
    }
    console.log(
      `    ${images.length} photo(s), ${data.keyFeatures?.length ?? 0} key feature(s), ${p.variants.length} variant(s)` +
        (files.length || !current ? '' : ' — photos kept'),
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
