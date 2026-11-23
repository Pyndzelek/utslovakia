/**
 * The catalogue listings' URL contract (`/products` and `/category/[slug]`): which query
 * params exist, how they're parsed, and which of them count as "a filter is active".
 * Pure — shared by the server pages, the client filter controls and the unit tests.
 */

/**
 * Sort orders accepted from `?sort=`. No value means the listing default: best match first
 * while searching, newest first otherwise.
 */
export const SORT_OPTIONS = [
  '-createdAt',
  'createdAt',
  'title',
  '-title',
  'price',
  '-price',
] as const
export type SortOption = (typeof SORT_OPTIONS)[number]

/** Badge values accepted from `?badge=` (the product `badge` select's options). */
export const BADGE_OPTIONS = ['bestseller', 'new'] as const
export type BadgeOption = (typeof BADGE_OPTIONS)[number]

/** `?stock=in_stock` — the only availability filter: hide what can't be ordered right now. */
export const IN_STOCK_VALUE = 'in_stock'

export type RawSearchParams = Record<string, string | string[] | undefined>

export interface CatalogParams {
  /** 1-based; anything unparsable is page 1. */
  page: number
  q?: string
  categoryIds: number[]
  brandIds: number[]
  badges: BadgeOption[]
  inStock: boolean
  minPrice?: number
  maxPrice?: number
  sort?: SortOption
}

const first = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value

/** `"1,4,x"` → `[1, 4]` — positive integers only, de-duplicated. */
export function parseIdList(value: string | undefined): number[] {
  if (!value) return []
  const ids = value
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isInteger(id) && id > 0)
  return [...new Set(ids)]
}

function parsePrice(value: string | undefined): number | undefined {
  if (!value) return undefined
  const amount = Number(value.replace(',', '.'))
  return Number.isFinite(amount) && amount >= 0 ? amount : undefined
}

export function parseCatalogParams(raw: RawSearchParams): CatalogParams {
  const page = Number(first(raw.page))
  const sort = first(raw.sort)
  const q = first(raw.q)?.trim()
  const badges = (first(raw.badge) ?? '').split(',')

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    q: q || undefined,
    categoryIds: parseIdList(first(raw.category)),
    brandIds: parseIdList(first(raw.brand)),
    badges: BADGE_OPTIONS.filter((badge) => badges.includes(badge)),
    inStock: first(raw.stock) === IN_STOCK_VALUE,
    minPrice: parsePrice(first(raw.minPrice)),
    maxPrice: parsePrice(first(raw.maxPrice)),
    sort: (SORT_OPTIONS as readonly string[]).includes(sort ?? '')
      ? (sort as SortOption)
      : undefined,
  }
}

/** How many filters narrow the listing — the search term, sort order and page don't count. */
export function activeFilterCount(params: CatalogParams): number {
  return (
    params.categoryIds.length +
    params.brandIds.length +
    params.badges.length +
    (params.inStock ? 1 : 0) +
    (params.minPrice !== undefined || params.maxPrice !== undefined ? 1 : 0)
  )
}

/**
 * Whether the URL shows something other than the plain listing. Such pages are kept out of
 * search indexes (`noindex`) and use the "nothing matches" empty state.
 */
export function isNarrowed(params: CatalogParams): boolean {
  return activeFilterCount(params) > 0 || Boolean(params.q) || Boolean(params.sort)
}

/** The listing's current query string values, minus `page` — what links and forms carry along. */
export function toQueryRecord(params: CatalogParams): Record<string, string> {
  const query: Record<string, string> = {}
  if (params.q) query.q = params.q
  if (params.categoryIds.length) query.category = params.categoryIds.join(',')
  if (params.brandIds.length) query.brand = params.brandIds.join(',')
  if (params.badges.length) query.badge = params.badges.join(',')
  if (params.inStock) query.stock = IN_STOCK_VALUE
  if (params.minPrice !== undefined) query.minPrice = String(params.minPrice)
  if (params.maxPrice !== undefined) query.maxPrice = String(params.maxPrice)
  if (params.sort) query.sort = params.sort
  return query
}

/** `basePath` + the given query values (empty ones dropped). */
export function buildListingHref(basePath: string, query: Record<string, string | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value) search.set(key, value)
  }
  const text = search.toString()
  return text ? `${basePath}?${text}` : basePath
}
