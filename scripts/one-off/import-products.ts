/**
 * One-off CSV → Payload product import.
 *
 *   pnpm payload run scripts/one-off/import-products.ts -- <path-to-csv> [--dry]
 *
 * Idempotent: products are matched by SKU (updated if present, created otherwise),
 * brands by name, categories by the mapping below. Text is written to the `en` locale and
 * mirrored into MIRROR_LOCALES as a placeholder until translated — a locale whose text
 * already differs from the English (i.e. was translated) is left alone.
 *
 * Tied to the production data it was written for: CATEGORY_MAP uses production category
 * IDs (4 = bill acceptors, 5 = coin acceptors), and products without a photo get the
 * existing Media doc whose filename is `maszynka.png`. Check both before running it anywhere else.
 */
import fs from 'node:fs'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Product } from '@/payload-types'

const LOCALE = 'en' as const
const MIRROR_LOCALES = ['pl'] as const
// Revalidation hooks need a Next.js request context, which a CLI script doesn't have.
const context = { disableRevalidate: true }
const PLACEHOLDER_MEDIA_FILENAME = 'maszynka.png'

// CSV category name (trimmed, lowercased) → existing category id, or a new category to create.
// NOTE: ids 4/5 are specific to the production DB this was run against — check before reuse.
const CATEGORY_MAP: Record<string, number | { name: string; slug: string }> = {
  'bill acceptor': 4, // Akceptory banknotów
  'coin acceptor': 5, // Akceptory monet
  printer: { name: 'Ticket / thermal printers', slug: 'ticket-thermal-printers' },
  'ticket printer / thermal printer': {
    name: 'Ticket / thermal printers',
    slug: 'ticket-thermal-printers',
  },
  'touch - non touch monitors and display': {
    name: 'Touch & non-touch monitors and displays',
    slug: 'monitors-displays',
  },
  hopper: { name: 'Hoppers', slug: 'hoppers' },
  backplain: { name: 'Backplanes', slug: 'backplanes' },
}

// CSV brand name (trimmed) → canonical brand name.
const BRAND_MAP: Record<string, string> = {
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

// Variant cells that aren't in the "1)… 2)…" format.
const VARIANT_OVERRIDES: Record<string, string[]> = {
  KONTROLERBACKPLAINCF2_UTS: ['Model "I"', 'Model "L"'],
}

const BADGES = new Set(['new', 'bestseller'])
const STOCK = new Set(['in_stock', 'out_of_stock', 'preorder'])

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
  return rows.filter((r) => r.some((f) => f.trim()))
}

const slugify = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/gi, 'l')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const num = (s: string) => {
  const n = parseFloat(s.replace(',', '.'))
  return Number.isFinite(n) ? n : undefined
}

// "PREFIX: 1)foo   2)bar\n3) baz" → ['foo', 'bar', 'baz']
function parseVariants(cell: string): string[] {
  const s = cell.replace(/^[\s"]+/, '')
  if (!/\d\)/.test(s)) return []
  return s
    .slice(s.search(/\d\)/))
    .split(/\d\)/)
    .map((v) =>
      v
        .replace(/\s+/g, ' ')
        .replace(/[,\s]+$/, '')
        .trim(),
    )
    .filter(Boolean)
}

// Pulls the "Key Features:" list out of a description into its own array.
function splitKeyFeatures(description: string): { description: string; keyFeatures: string[] } {
  const lines = description.split(/\r?\n/)
  const start = lines.findIndex((l) => /^key features:?$/i.test(l.trim()))
  if (start === -1) return { description, keyFeatures: [] }
  let end = start + 1
  while (end < lines.length && !lines[end].trim()) end++
  const keyFeatures: string[] = []
  while (end < lines.length && lines[end].trim() && !/^[^:]{1,50}:$/.test(lines[end].trim())) {
    keyFeatures.push(lines[end].trim())
    end++
  }
  const rest = [...lines.slice(0, start), ...lines.slice(end)].join('\n')
  return { description: rest.replace(/\n{3,}/g, '\n\n').trim(), keyFeatures }
}

const [csvPath, ...flags] = process.argv.slice(2).filter((a) => a !== '--')
const dry = flags.includes('--dry')
if (!csvPath) throw new Error('Usage: payload run scripts/one-off/import-products.ts -- <csv> [--dry]')

const [header, ...rows] = parseCsv(fs.readFileSync(csvPath, 'utf8'))
const col = (name: string) => header.indexOf(name)
const variantCols = header.flatMap((h, i) => (h === 'variant' ? [i] : []))

const payload = await getPayload({ config })

const placeholder = await payload.find({
  collection: 'media',
  where: { filename: { equals: PLACEHOLDER_MEDIA_FILENAME } },
  limit: 1,
})
const placeholderId = placeholder.docs[0]?.id
if (!placeholderId) throw new Error(`Placeholder media "${PLACEHOLDER_MEDIA_FILENAME}" not found`)

const categoryIds = new Map<string, number>()
async function resolveCategory(raw: string): Promise<number> {
  const target = CATEGORY_MAP[raw.trim().toLowerCase()]
  if (target === undefined) throw new Error(`Unmapped category "${raw}"`)
  if (typeof target === 'number') return target
  const cached = categoryIds.get(target.slug)
  if (cached) return cached
  const existing = await payload.find({
    collection: 'categories',
    where: { slug: { equals: target.slug } },
    locale: LOCALE,
    limit: 1,
  })
  let id = existing.docs[0]?.id
  if (!id) {
    console.log(`  + category "${target.name}"`)
    id = dry
      ? -1
      : (
          await payload.create({
            collection: 'categories',
            locale: LOCALE,
            data: { ...target, image: placeholderId, status: 'active' },
            context,
          })
        ).id
  }
  if (!dry) {
    for (const locale of MIRROR_LOCALES) {
      const doc = await payload.findByID({
        collection: 'categories',
        id,
        locale,
        fallbackLocale: false,
      })
      if (doc.name && doc.name !== target.name) continue
      await payload.update({ collection: 'categories', id, locale, data: target, context })
    }
  }
  categoryIds.set(target.slug, id)
  return id
}

const brandIds = new Map<string, number>()
async function resolveBrand(raw: string): Promise<number | undefined> {
  if (!raw.trim()) return undefined
  const name = BRAND_MAP[raw.trim()]
  if (!name) throw new Error(`Unmapped brand "${raw}"`)
  const cached = brandIds.get(name)
  if (cached) return cached
  const existing = await payload.find({
    collection: 'brands',
    where: { name: { equals: name } },
    limit: 1,
  })
  let id = existing.docs[0]?.id
  if (!id) {
    console.log(`  + brand "${name}"`)
    id = dry ? -1 : (await payload.create({ collection: 'brands', data: { name } })).id
  }
  brandIds.set(name, id)
  return id
}

for (const r of rows) {
  const get = (name: string) => (r[col(name)] ?? '').trim()
  const sku = get('sku')
  const title = get('title').replace(/\s+/g, ' ')
  const badge = get('badge').toLowerCase()
  const stockStatus = get('stockStatus')
  const variantNames =
    VARIANT_OVERRIDES[sku] ?? variantCols.flatMap((i) => parseVariants(r[i] ?? ''))

  const { description, keyFeatures } = splitKeyFeatures(get('description'))

  const data = {
    slug: slugify(get('slug') || title),
    sku,
    title,
    description,
    keyFeatures: keyFeatures.map((text) => ({ text })),
    status: get('status') as Product['status'],
    stockStatus: (STOCK.has(stockStatus) ? stockStatus : 'in_stock') as Product['stockStatus'],
    badge: (BADGES.has(badge) ? badge : null) as Product['badge'],
    brand: await resolveBrand(get('brand_name')),
    categories: [await resolveCategory(get('category_name'))],
    link: get('external_link (ebay)') || undefined,
    warranty: num(get('warranty_months')),
    prices: {
      PLN: num(get('price_PLN'))!,
      EUR: num(get('price_EUR')),
      USD: num(get('price_USD')),
      BRL: num(get('price_BRL')),
    },
    variants: variantNames.map((modelName) => ({ modelName })),
  }

  const existing = await payload.find({
    collection: 'products',
    where: { sku: { equals: sku } },
    limit: 1,
    depth: 0,
  })
  const current = existing.docs[0]
  console.log(`${current ? '~ update' : '+ create'} ${sku} → /${data.slug}`)
  if (data.variants.length) console.log(`    variants: ${variantNames.join(' | ')}`)
  if (dry) continue

  const saved = current
    ? await payload.update({
        collection: 'products',
        id: current.id,
        locale: LOCALE,
        data,
        depth: 0,
        context,
      })
    : await payload.create({
        collection: 'products',
        locale: LOCALE,
        data: { ...data, images: [{ image: placeholderId, alt: title }] },
        depth: 0,
        context,
      })

  // Copy the localized fields into the other locales, reusing array row ids so rows are shared.
  for (const locale of MIRROR_LOCALES) {
    const doc = await payload.findByID({
      collection: 'products',
      id: saved.id,
      locale,
      fallbackLocale: false,
      depth: 0,
    })
    if (doc.title && doc.title !== title) continue
    await payload.update({
      collection: 'products',
      id: saved.id,
      locale,
      depth: 0,
      context,
      data: {
        title: saved.title,
        description: saved.description,
        images: saved.images.map(({ id, image, alt }) => ({ id, image, alt })),
        keyFeatures: saved.keyFeatures?.map(({ id, text }) => ({ id, text })),
        variants: saved.variants?.map((v) => ({ ...v })),
      },
    })
  }
}

console.log(dry ? '\nDry run — nothing written.' : `\nImported ${rows.length} products.`)
process.exit(0)
