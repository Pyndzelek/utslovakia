/**
 * Downloads every active listing in the eBay store into a JSON file for import.ts.
 *
 *   pnpm exec tsx --env-file=.env scripts/one-off/ebay/fetch.ts [out.json]
 *
 * Uses the eBay Trading API (GetMyeBaySelling → GetItem per listing, GetStore for store
 * category names) with the seller's own token, so it sees exactly what's live in the store —
 * full descriptions, item specifics, all photos and variations. Doesn't touch the database.
 *
 * Env:
 *   EBAY_AUTH_TOKEN  seller token for the store account — either an Auth'n'Auth token
 *                    ("AgAAAA…") or an OAuth user token ("v^1.1#…") with the sell scopes
 *   EBAY_SITE_ID     eBay site the listings are on (default 0 = ebay.com; 77 = ebay.de)
 */
import fs from 'node:fs'
import { XMLParser } from 'fast-xml-parser'
import type { EbayListing, EbayVariation, Money } from './types'

const ENDPOINT = 'https://api.ebay.com/ws/api.dll'
const COMPATIBILITY_LEVEL = '1349'
const CONCURRENCY = 4

const token = process.env.EBAY_AUTH_TOKEN
const siteId = process.env.EBAY_SITE_ID ?? '0'
const out = process.argv.slice(2).find((a) => a !== '--') ?? 'ebay-listings.json'
if (!token) throw new Error('Set EBAY_AUTH_TOKEN (see the comment at the top of this file)')
const isOAuth = token.startsWith('v^')

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  // Keep everything as strings — item IDs overflow JS numbers.
  parseTagValue: false,
  isArray: (name) =>
    [
      'Item',
      'Errors',
      'NameValueList',
      'Value',
      'PictureURL',
      'Variation',
      'VariationSpecificPictureSet',
      'CustomCategory',
      'ChildCategory',
    ].includes(name),
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped XML response
type Xml = any

async function call(callName: string, body: string): Promise<Xml> {
  const credentials = isOAuth
    ? ''
    : `<RequesterCredentials><eBayAuthToken>${token}</eBayAuthToken></RequesterCredentials>`
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
      'X-EBAY-API-CALL-NAME': callName,
      'X-EBAY-API-SITEID': siteId,
      'X-EBAY-API-COMPATIBILITY-LEVEL': COMPATIBILITY_LEVEL,
      ...(isOAuth ? { 'X-EBAY-API-IAF-TOKEN': token! } : {}),
    },
    body: `<?xml version="1.0" encoding="utf-8"?><${callName}Request xmlns="urn:ebay:apis:eBLBaseComponents">${credentials}${body}</${callName}Request>`,
  })
  const xml = parser.parse(await res.text())[`${callName}Response`]
  if (!xml) throw new Error(`${callName}: HTTP ${res.status}, unexpected response`)
  if (xml.Ack === 'Failure') {
    const messages = (xml.Errors ?? []).map((e: Xml) => e.LongMessage ?? e.ShortMessage)
    throw new Error(`${callName} failed: ${messages.join('; ')}`)
  }
  return xml
}

const money = (node: Xml): Money => ({
  value: Number(node?.['#text'] ?? node ?? 0),
  currency: node?.['@_currencyID'] ?? 'USD',
})

/** Swap eBay's thumbnail size for the largest one (1600px). */
const fullSize = (url: string) =>
  url.replace(/\/s-l\d+\./, '/s-l1600.').replace(/\$_\d+\.(jpe?g|png)/i, '$_57.$1')

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  bull: '•',
  deg: '°',
}

/** Seller HTML description → plain text in the format the product page renders. */
function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|head)[\s\S]*?<\/\1>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|ul|ol|table|section)>/gi, '\n\n')
    .replace(/<\/(li|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(x?)([0-9a-f]+);/gi, (_, hex, code) =>
      String.fromCodePoint(parseInt(code, hex ? 16 : 10)),
    )
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .split('\n')
    .map((line) => line.replace(/[ \t ]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const pairs = (list: Xml): [string, string][] =>
  (list?.NameValueList ?? []).map((nv: Xml) => [nv.Name, (nv.Value ?? []).join(', ')])

// ---- Store categories (id → name, including sub-categories) ----
const storeCategories = new Map<string, string>()
try {
  const store = await call('GetStore', '<LevelLimit>3</LevelLimit>')
  const walk = (cats: Xml[] = []) => {
    for (const cat of cats) {
      storeCategories.set(String(cat.CategoryID), cat.Name)
      walk(cat.ChildCategory)
    }
  }
  walk(store.Store?.CustomCategories?.CustomCategory)
  console.log(`${storeCategories.size} store categories`)
} catch (err) {
  console.warn(`Couldn't read store categories (${(err as Error).message}) — continuing without`)
}

// ---- Active listing IDs ----
const itemIds: string[] = []
for (let page = 1, pages = 1; page <= pages; page++) {
  const res = await call(
    'GetMyeBaySelling',
    `<ActiveList><Include>true</Include><Pagination><EntriesPerPage>200</EntriesPerPage><PageNumber>${page}</PageNumber></Pagination></ActiveList>`,
  )
  pages = Number(res.ActiveList?.PaginationResult?.TotalNumberOfPages ?? 1)
  for (const item of res.ActiveList?.ItemArray?.Item ?? []) itemIds.push(String(item.ItemID))
}
console.log(`${itemIds.length} active listings`)

// ---- Full details per listing ----
async function getListing(itemId: string): Promise<EbayListing> {
  const {
    Item: [item],
  } = await call(
    'GetItem',
    `<ItemID>${itemId}</ItemID><DetailLevel>ReturnAll</DetailLevel><IncludeItemSpecifics>true</IncludeItemSpecifics>`,
  )
  const available = (node: Xml) =>
    Math.max(0, Number(node.Quantity ?? 0) - Number(node.SellingStatus?.QuantitySold ?? 0))

  const variations: EbayVariation[] = (item.Variations?.Variation ?? []).map((v: Xml) => ({
    name: pairs(v.VariationSpecifics)
      .map(([, value]) => value)
      .join(' / '),
    sku: v.SKU || undefined,
    price: money(v.StartPrice),
    quantityAvailable: available(v),
  }))

  const pictures: string[] = [
    ...(item.PictureDetails?.PictureURL ?? []),
    ...(item.Variations?.Pictures?.VariationSpecificPictureSet ?? []).flatMap(
      (set: Xml) => set.PictureURL ?? [],
    ),
  ]

  return {
    itemId,
    sku: item.SKU || undefined,
    title: String(item.Title).trim(),
    url: `https://www.ebay.com/itm/${itemId}`,
    storeCategory: storeCategories.get(String(item.Storefront?.StoreCategoryID)),
    ebayCategory: item.PrimaryCategory?.CategoryName,
    condition: item.ConditionDisplayName,
    conditionDescription: item.ConditionDescription,
    price: money(item.SellingStatus?.CurrentPrice ?? item.StartPrice),
    quantityAvailable: variations.length
      ? variations.reduce((sum, v) => sum + v.quantityAvailable, 0)
      : available(item),
    specifics: pairs(item.ItemSpecifics),
    description: htmlToText(item.Description ?? ''),
    images: [...new Set(pictures.map(fullSize))],
    variations,
  }
}

const listings: EbayListing[] = []
for (let i = 0; i < itemIds.length; i += CONCURRENCY) {
  const batch = await Promise.all(itemIds.slice(i, i + CONCURRENCY).map(getListing))
  listings.push(...batch)
  console.log(`  ${listings.length}/${itemIds.length}`)
}

fs.writeFileSync(out, JSON.stringify(listings, null, 2))
console.log(`Wrote ${listings.length} listings to ${out}`)
