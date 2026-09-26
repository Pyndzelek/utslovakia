/**
 * Imports the listings downloaded by fetch.ts into the catalogue.
 *
 *   pnpm payload run scripts/one-off/ebay/import.ts -- <listings.json> [--dry] [--publish]
 *
 * For each listing:
 * - Already in the catalogue (same SKU / `EBAY-<itemId>` SKU, or its eBay link contains the
 *   item ID): text, prices and translations are left alone. The eBay link is filled in if
 *   missing, stock status follows the eBay quantity, and the eBay photos replace the
 *   `maszynka.png` placeholder if the product still has it.
 * - New: created from the listing (English text, mirrored into `pl` until translated), as a
 *   draft unless --publish is passed. Prices are converted from the listing currency into
 *   PLN/EUR/USD/BRL at today's NBP mid rates. Category is picked by CATEGORY_RULES; listings
 *   no rule matches go into an "Other parts" category, created on first use.
 */
import fs from 'node:fs'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import { slugify } from '@/fields/slug'
import type { Product } from '@/payload-types'
import { BRAND_MAP, findPlaceholderId, scriptContext, uploadImage } from '../lib'
import type { EbayListing, Money } from './types'

// First match wins, tested against "<store category> <title> <eBay category>". Values are
// the categories' `en` slugs.
const CATEGORY_RULES: [RegExp, string][] = [
  [/hopper/i, 'hoppers'],
  [/printer|drukark/i, 'ticket-thermal-printers'],
  [/monitor|display|touch ?screen|\blcd\b/i, 'monitors-displays'],
  [/backpla/i, 'backplanes'],
  [/coin|moneta|\bmonet/i, 'coins-acceptor'],
  [/bill|banknot|note|validator|\bnv\d|ivizion|\buba\b/i, 'bill-acceptors'],
]
const FALLBACK_CATEGORY = {
  en: { name: 'Other parts', slug: 'other-parts' },
  pl: { name: 'Pozostałe części', slug: 'pozostale-czesci' },
  sk: { name: 'Ostatné diely', slug: 'ostatne-diely' },
  'pt-br': { name: 'Outras peças', slug: 'outras-pecas' },
} as const

const CURRENCIES = ['PLN', 'EUR', 'USD', 'BRL'] as const
type Prices = Record<(typeof CURRENCIES)[number], number>
const IGNORED_BRANDS = /^(unbranded|does not apply|n\/?a|brak|-)$/i

const [file, ...flags] = process.argv.slice(2).filter((a) => a !== '--')
const dry = flags.includes('--dry')
const publish = flags.includes('--publish')
if (!file)
  throw new Error(
    'Usage: payload run scripts/one-off/ebay/import.ts -- <listings.json> [--dry] [--publish]',
  )
const listings: EbayListing[] = JSON.parse(fs.readFileSync(file, 'utf8'))

// ---- Exchange rates: PLN per unit, from the Polish central bank ----
const nbp = await fetch('https://api.nbp.pl/api/exchangerates/tables/A/?format=json')
const [table] = (await nbp.json()) as {
  effectiveDate: string
  rates: { code: string; mid: number }[]
}[]
const plnPer = Object.fromEntries([['PLN', 1], ...table.rates.map((r) => [r.code, r.mid])])
console.log(
  `NBP rates ${table.effectiveDate}: EUR ${plnPer.EUR}, USD ${plnPer.USD}, BRL ${plnPer.BRL}`,
)

function convert({ value, currency }: Money): Prices {
  const rate = plnPer[currency]
  if (!rate) throw new Error(`No NBP rate for ${currency}`)
  const pln = value * rate
  // Keep the listing's own price exact; round the converted ones to whole units.
  return Object.fromEntries(
    CURRENCIES.map((c) => [c, c === currency ? value : Math.round(pln / plnPer[c])]),
  ) as Prices
}

const payload = await getPayload({ config })
const placeholderId = await findPlaceholderId(payload)

// ---- Lookups ----
const categoryIds = new Map<string, number>()
async function categoryFor(listing: EbayListing): Promise<{ id: number; slug: string }> {
  const haystack = `${listing.storeCategory ?? ''} ${listing.title} ${listing.ebayCategory ?? ''}`
  const slug = CATEGORY_RULES.find(([re]) => re.test(haystack))?.[1] ?? FALLBACK_CATEGORY.en.slug
  if (!categoryIds.has(slug)) categoryIds.set(slug, await findOrCreateCategory(payload, slug))
  return { id: categoryIds.get(slug)!, slug }
}

async function findOrCreateCategory(payload: Payload, slug: string): Promise<number> {
  const { docs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    locale: 'en',
    limit: 1,
    overrideAccess: true,
  })
  if (docs[0]) return docs[0].id
  if (slug !== FALLBACK_CATEGORY.en.slug)
    throw new Error(`Category with en slug "${slug}" not found`)
  console.log(`  + category "${FALLBACK_CATEGORY.en.name}"`)
  if (dry) return -1
  if (!placeholderId) throw new Error('Placeholder media not found — needed as the category image')
  const { id } = await payload.create({
    collection: 'categories',
    locale: 'en',
    data: { ...FALLBACK_CATEGORY.en, image: placeholderId, status: 'active' },
    context: scriptContext(),
  })
  for (const locale of ['pl', 'sk', 'pt-br'] as const) {
    await payload.update({
      collection: 'categories',
      id,
      locale,
      data: FALLBACK_CATEGORY[locale],
      context: scriptContext(),
    })
  }
  return id
}

const brandIds = new Map<string, number>()
async function brandFor(listing: EbayListing): Promise<number | undefined> {
  const raw = listing.specifics.find(([name]) => /^(brand|manufacturer|marka)$/i.test(name))?.[1]
  if (!raw || IGNORED_BRANDS.test(raw.trim())) return undefined
  const name = BRAND_MAP[raw.trim()] ?? raw.trim()
  const key = name.toLowerCase()
  if (brandIds.has(key)) return brandIds.get(key)
  const { docs } = await payload.find({ collection: 'brands', limit: 1000, depth: 0 })
  let id = docs.find((b) => b.name.toLowerCase() === key)?.id
  if (!id) {
    console.log(`  + brand "${name}"`)
    id = dry
      ? -1
      : (await payload.create({ collection: 'brands', data: { name }, context: scriptContext() }))
          .id
  }
  brandIds.set(key, id)
  return id
}

async function findExisting(listing: EbayListing): Promise<Product | undefined> {
  const { docs } = await payload.find({
    collection: 'products',
    where: {
      or: [
        ...(listing.sku ? [{ sku: { equals: listing.sku } }] : []),
        { sku: { equals: `EBAY-${listing.itemId}` } },
        { link: { contains: listing.itemId } },
      ],
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  })
  return docs[0]
}

async function uniqueSlug(title: string, itemId: string): Promise<string> {
  const slug = slugify(title)
  const { totalDocs } = await payload.count({
    collection: 'products',
    where: { slug: { equals: slug } },
    overrideAccess: true,
  })
  return totalDocs ? `${slug}-${itemId}` : slug
}

async function uploadPhotos(listing: EbayListing, slug: string, alt: string): Promise<number[]> {
  const ids: number[] = []
  for (const [i, url] of listing.images.entries()) {
    if (dry) {
      console.log(`    ↑ ${url}`)
      continue
    }
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`    ✗ ${url}: HTTP ${res.status}`)
      continue
    }
    const name = `${slug}-${String(i + 1).padStart(2, '0')}`
    ids.push(await uploadImage(payload, Buffer.from(await res.arrayBuffer()), name, alt))
  }
  return ids
}

/** Listing description plus the item specifics it doesn't already mention. */
function describe(listing: EbayListing): string {
  const text = listing.description
  const specifics = [
    ...listing.specifics,
    ...(listing.condition ? [['Condition', listing.condition] as [string, string]] : []),
  ].filter(([, value]) => value && !text.toLowerCase().includes(value.toLowerCase()))
  const parts = [text || listing.title]
  if (specifics.length)
    parts.push(
      ['Item specifics:', ...specifics.map(([name, value]) => `${name}: ${value}`)].join('\n'),
    )
  if (listing.conditionDescription) parts.push(listing.conditionDescription)
  return parts.join('\n\n')
}

const stock = (qty: number) => (qty > 0 ? 'in_stock' : 'out_of_stock') as Product['stockStatus']

// ---- Import ----
const summary = { created: 0, updated: 0, unchanged: 0 }
for (const listing of listings) {
  const existing = await findExisting(listing)

  if (existing) {
    const data: Partial<Product> = {}
    if (!existing.link) data.link = listing.url
    if (existing.stockStatus !== stock(listing.quantityAvailable))
      data.stockStatus = stock(listing.quantityAvailable)
    const onlyPlaceholder = existing.images.every((i) => i.image === placeholderId)
    const needsPhotos = onlyPlaceholder && listing.images.length > 0
    if (!Object.keys(data).length && !needsPhotos) {
      summary.unchanged++
      continue
    }
    console.log(
      `~ ${existing.sku} ← eBay ${listing.itemId}: ${[...Object.keys(data), ...(needsPhotos ? [`${listing.images.length} photos`] : [])].join(', ')}`,
    )
    summary.updated++
    if (needsPhotos) {
      const ids = await uploadPhotos(listing, existing.slug, existing.title)
      if (ids.length) await replacePhotos(existing.id, ids)
    }
    if (!dry && Object.keys(data).length)
      await payload.update({
        collection: 'products',
        id: existing.id,
        data,
        context: scriptContext(),
      })
    continue
  }

  const category = await categoryFor(listing)
  const prices = convert(listing.price)
  const slug = await uniqueSlug(listing.title, listing.itemId)
  console.log(
    `+ ${listing.itemId} → /${slug} [${category.slug}] ${listing.price.value} ${listing.price.currency}` +
      `${listing.variations.length ? `, ${listing.variations.length} variants` : ''}, ${listing.images.length} photos`,
  )
  summary.created++
  const brand = await brandFor(listing)
  const photoIds = await uploadPhotos(listing, slug, listing.title)
  if (dry) continue
  if (!photoIds.length && !placeholderId) {
    console.warn(`  ✗ skipped: no photos and no placeholder media`)
    continue
  }

  const created = await payload.create({
    collection: 'products',
    locale: 'en',
    depth: 0,
    context: scriptContext(),
    data: {
      slug,
      sku: listing.sku ?? `EBAY-${listing.itemId}`,
      title: listing.title,
      description: describe(listing),
      status: publish ? 'published' : 'draft',
      stockStatus: stock(listing.quantityAvailable),
      brand,
      link: listing.url,
      categories: [category.id],
      prices,
      images: (photoIds.length ? photoIds : [placeholderId!]).map((image) => ({
        image,
        alt: listing.title,
      })),
      variants: listing.variations.map((v) => {
        const own = convert(v.price)
        const overrides = Object.fromEntries(
          CURRENCIES.filter((c) => own[c] !== prices[c]).map((c) => [c, own[c]]),
        )
        return {
          modelName: v.name,
          sku: v.sku,
          stockStatus: stock(v.quantityAvailable),
          priceOverrides: overrides,
        }
      }),
    },
  })

  // Mirror the English text into the default locale so Polish pages aren't blank until translated.
  await payload.update({
    collection: 'products',
    id: created.id,
    locale: 'pl',
    depth: 0,
    context: scriptContext(),
    data: {
      title: created.title,
      description: created.description,
      images: created.images.map(({ id, image, alt }) => ({ id, image, alt })),
      variants: created.variants?.map((v) => ({ ...v })),
    },
  })
}

/** Replaces a product's photos, writing the alt text for every locale into the new rows. */
async function replacePhotos(id: number, mediaIds: number[]) {
  if (dry) return
  const locales = ['pl', 'en', 'sk', 'pt-br'] as const
  const titles = {} as Record<(typeof locales)[number], string>
  for (const locale of locales)
    titles[locale] = (
      await payload.findByID({ collection: 'products', id, locale, depth: 0 })
    ).title
  let saved = await payload.update({
    collection: 'products',
    id,
    locale: 'pl',
    depth: 0,
    context: scriptContext(),
    data: { images: mediaIds.map((image) => ({ image, alt: titles.pl })) },
  })
  for (const locale of locales.slice(1)) {
    saved = await payload.update({
      collection: 'products',
      id,
      locale,
      depth: 0,
      context: scriptContext(),
      data: {
        images: saved.images.map(({ id: rowId, image }) => ({
          id: rowId,
          image,
          alt: titles[locale],
        })),
      },
    })
  }
}

console.log(
  `\n${dry ? '[dry] ' : ''}${summary.created} new, ${summary.updated} updated, ${summary.unchanged} unchanged` +
    (summary.created && !publish ? ' — new products are drafts; publish them in the admin' : ''),
)
process.exit(0)
