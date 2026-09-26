import { getPayload, type Payload, Where, WhereField } from 'payload'
import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import config from '@payload-config'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import type { Locale } from '@/i18n/routing'
import { Product } from '@/payload-types'
import { currencyForLocale } from '@/lib/currency'
import { searchWords } from '@/lib/search'

/**
 * Data access for the `products` Payload collection.
 *
 * Every export is wrapped in React's `cache()` (dedupes repeated calls within
 * a single request, e.g. `generateMetadata` and the page body fetching the
 * same product) around `unstable_cache` (caches across requests). Cached
 * reads share one `'products'` tag rather than per-doc tags — `unstable_cache`
 * tags are static per wrapped function, so per-doc tags aren't practical here;
 * `Product`'s `afterChange`/`afterDelete` hooks (src/collections/Product.ts)
 * call `revalidateTag('products')` on any change, which evicts all of these.
 * The `revalidate` values below are just the timed fallback behind that.
 */

const PRODUCTS_TAG = 'products'

export const getProductBySlug = cache(
  unstable_cache(
    async (slug: string, locale: Locale): Promise<Product | undefined> => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'products',
        locale,
        where: { slug: { equals: slug }, status: { equals: 'published' } },
        depth: 1,
      })
      return docs[0] ?? undefined
    },
    ['product-by-slug'],
    { tags: [PRODUCTS_TAG], revalidate: 3600 },
  ),
)

/**
 * All published product slugs in a given locale — used for `generateStaticParams`
 * and the sitemap. `depth: 0` + `select` keeps this cheap even as the catalogue grows.
 */
export const getAllProductSlugs = cache(
  unstable_cache(
    async (locale: Locale): Promise<string[]> => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'products',
        locale,
        where: { status: { equals: 'published' } },
        select: { slug: true },
        depth: 0,
        pagination: false,
      })
      return docs.map((doc) => doc.slug)
    },
    ['product-slugs'],
    { tags: [PRODUCTS_TAG], revalidate: 3600 },
  ),
)

/**
 * Same as `getAllProductSlugs`, but also carries `updatedAt` for the sitemap's
 * `lastModified` — kept separate so `generateStaticParams` (which doesn't need
 * dates) isn't paying for the extra selected field.
 */
export const getAllProductSlugsWithDates = cache(
  unstable_cache(
    async (locale: Locale): Promise<{ slug: string; updatedAt: string }[]> => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'products',
        locale,
        where: { status: { equals: 'published' } },
        select: { slug: true, updatedAt: true },
        depth: 0,
        pagination: false,
      })
      return docs.map((doc) => ({ slug: doc.slug, updatedAt: doc.updatedAt }))
    },
    ['product-slugs-with-dates'],
    { tags: [PRODUCTS_TAG], revalidate: 3600 },
  ),
)

export const getProductsByCategory = cache(
  unstable_cache(
    async (categoryId: number, locale: Locale): Promise<Product[]> => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'products',
        locale,
        where: {
          categories: { equals: categoryId },
          status: { equals: 'published' },
        },
        depth: 1,
      })
      return docs
    },
    ['products-by-category'],
    { tags: [PRODUCTS_TAG], revalidate: 3600 },
  ),
)

/**
 * Counts published products per category in a single query, instead of one
 * `count()` round-trip per category — cheaper when listing many categories.
 * Returns a plain object (category id → count) so it survives
 * `unstable_cache`'s JSON serialization.
 */
export const getProductCountsByCategory = cache(
  unstable_cache(
    async (locale: Locale): Promise<Record<number, number>> => {
      const payload = await getPayload({ config })

      const { docs } = await payload.find({
        collection: 'products',
        locale,
        where: { status: { equals: 'published' } },
        select: { categories: true },
        depth: 0, // categories come back as bare ids, which is all we count here
        pagination: false,
      })

      const counts: Record<number, number> = {}
      for (const product of docs) {
        for (const category of product.categories) {
          const categoryId = typeof category === 'number' ? category : category.id
          counts[categoryId] = (counts[categoryId] ?? 0) + 1
        }
      }

      return counts
    },
    ['product-counts-by-category'],
    { tags: [PRODUCTS_TAG], revalidate: 3600 },
  ),
)

/** Bestseller-badged products for the home page. */
export const getBestsellers = cache(
  unstable_cache(
    async (locale: Locale, limit = 8): Promise<Product[]> => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'products',
        locale,
        where: { status: { equals: 'published' }, badge: { equals: 'bestseller' } },
        sort: '-createdAt',
        limit,
        depth: 1,
      })
      return docs
    },
    ['bestseller-products'],
    { tags: [PRODUCTS_TAG], revalidate: 3600 },
  ),
)

/** Most recently published products for the home page. */
export const getNewArrivals = cache(
  unstable_cache(
    async (locale: Locale, limit = 8): Promise<Product[]> => {
      const payload = await getPayload({ config })
      const { docs } = await payload.find({
        collection: 'products',
        locale,
        where: { status: { equals: 'published' } },
        sort: '-createdAt',
        limit,
        depth: 1,
      })
      return docs
    },
    ['new-arrival-products'],
    { tags: [PRODUCTS_TAG], revalidate: 3600 },
  ),
)

export interface GetFilteredProductsOptions {
  /** Single category ID or an array of IDs for multi-category filtering */
  categoryIds?: number | number[]
  /** Minimum price inclusive */
  minPrice?: number
  /** Maximum price inclusive */
  maxPrice?: number
  /** Page number for pagination (1-indexed) */
  page?: number
  /** Number of items per page */
  limit?: number
  /** Free-text search across the product's text in every locale (see `searchProductIds`). */
  search?: string
  /** Only products carrying one of these badges (values straight from the URL; unknown ones are ignored). */
  badges?: string[]
  /**
   * One of `SORT_OPTIONS`. Anything else (or nothing) lists search results best match
   * first and everything else newest first.
   */
  sort?: string
  /** Filter by publication status */
  status?: 'published' | 'draft'
}

export interface PaginatedProductsResult {
  docs: Product[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

/** Sort orders accepted from the `?sort=` query param. */
export const SORT_OPTIONS = ['-createdAt', 'createdAt', 'title', '-title'] as const

/** Badge values accepted from the `?badge=` query param (the `badge` select's options). */
const BADGE_OPTIONS: readonly string[] = ['new', 'bestseller'] satisfies NonNullable<
  Product['badge']
>[]

/**
 * IDs of every product whose text contains all the search `words`, best matches first.
 *
 * Searches all locales at once — the visitor's locale only decides how results are shown —
 * so "touch screen" on the Polish site finds "Monitor dotykowy…" through its English title.
 * Diacritics are folded on both sides with `unaccent()` (enabled by the `search_unaccent`
 * migration), so "wyswietlacz" finds "wyświetlacz"; that also makes ILIKE case-insensitive
 * for accented letters, which it isn't under the database's `C` ctype.
 *
 * Words may be spread over any fields. Products whose title, SKU or brand alone contain
 * every word rank first; the rest matched through their description, key features or
 * variants. Status isn't checked here: the caller's Payload query filters on it along with
 * everything else. Raw SQL because Payload's `like` can't fold diacritics; the table names
 * are the ones Payload generates for the `products` collection.
 */
async function searchProductIds(payload: Payload, words: string[]): Promise<number[]> {
  const { drizzle } = payload.db as unknown as PostgresAdapter
  const containsEvery = (text: ReturnType<typeof sql>) =>
    sql.join(
      words.map((word) => sql`${text} ILIKE unaccent(${`%${word}%`}::text)`),
      sql` AND `,
    )

  const { rows } = await drizzle.execute<{ id: number }>(sql`
    WITH product_text AS (
      SELECT
        p.id,
        p.created_at,
        unaccent(concat_ws(' ', p.sku, b.name,
          (SELECT string_agg(l.title, ' ') FROM products_locales l WHERE l._parent_id = p.id)
        )) AS headline,
        unaccent(concat_ws(' ',
          (SELECT string_agg(l.description, ' ') FROM products_locales l WHERE l._parent_id = p.id),
          (SELECT string_agg(kl.text, ' ')
            FROM products_key_features k
            JOIN products_key_features_locales kl ON kl._parent_id = k.id
            WHERE k._parent_id = p.id),
          (SELECT string_agg(concat_ws(' ', v.sku, vl.model_name), ' ')
            FROM products_variants v
            LEFT JOIN products_variants_locales vl ON vl._parent_id = v.id
            WHERE v._parent_id = p.id)
        )) AS details
      FROM products p
      LEFT JOIN brands b ON b.id = p.brand_id
    )
    SELECT id FROM product_text
    WHERE ${containsEvery(sql`(headline || ' ' || details)`)}
    ORDER BY ${containsEvery(sql`headline`)} DESC, created_at DESC
  `)
  return rows.map((row) => row.id)
}

/** One page of products from `ids`, kept in the given order (Payload can't sort by search rank). */
async function findPageInOrder(
  payload: Payload,
  locale: Locale,
  ids: number[],
  page: number,
  limit: number,
): Promise<PaginatedProductsResult> {
  const current = Number.isInteger(page) && page > 0 ? page : 1
  const pageIds = ids.slice((current - 1) * limit, current * limit)
  const { docs } =
    pageIds.length > 0
      ? await payload.find({
          collection: 'products',
          locale,
          where: { id: { in: pageIds } },
          depth: 1,
          pagination: false,
        })
      : { docs: [] }
  const position = new Map(pageIds.map((id, index) => [id, index]))
  docs.sort((a, b) => position.get(a.id)! - position.get(b.id)!)

  const totalPages = Math.ceil(ids.length / limit)
  return {
    docs,
    totalDocs: ids.length,
    limit,
    totalPages,
    page: current,
    hasNextPage: current < totalPages,
    hasPrevPage: current > 1,
  }
}

export const getFilteredProducts = cache(
  unstable_cache(
    async (
      locale: Locale,
      options: GetFilteredProductsOptions = {},
    ): Promise<PaginatedProductsResult> => {
      const {
        categoryIds,
        minPrice,
        maxPrice,
        page = 1,
        limit = 12,
        sort,
        status = 'published',
        search,
        badges,
      } = options

      const payload = await getPayload({ config })
      // `sort` comes straight from the URL; never pass arbitrary field paths to the DB.
      const safeSort = sort && (SORT_OPTIONS as readonly string[]).includes(sort) ? sort : undefined

      const where: Where = {
        status: { equals: status },
      }

      // apply Category Filtering (prevents NaN database crashes)
      if (categoryIds !== undefined) {
        if (Array.isArray(categoryIds) && categoryIds.length > 0) {
          // Clean array to ensure only valid integers are sent to SQL
          const validIds = categoryIds.filter((id) => typeof id === 'number' && !isNaN(id))
          if (validIds.length > 0) {
            where.categories = { in: validIds }
          }
        } else if (typeof categoryIds === 'number' && !isNaN(categoryIds)) {
          where.categories = { equals: categoryIds }
        }
      }

      // `badge` is a Postgres enum: an unknown value would throw rather than match nothing.
      const validBadges = badges?.filter((badge) => BADGE_OPTIONS.includes(badge))
      if (validBadges?.length) {
        where.badge = { in: validBadges }
      }

      const conditions: Where[] = []

      // Filter on the price the visitor actually sees: the locale's currency
      // when a product has it set, its PLN base price otherwise (PLN is the
      // only required currency) — mirrors `resolvePrice` in src/lib/currency.ts.
      const currency = currencyForLocale(locale)
      const priceRange = (range: WhereField): Where =>
        currency === 'PLN'
          ? { 'prices.PLN': range }
          : {
              or: [
                { [`prices.${currency}`]: range },
                {
                  and: [{ [`prices.${currency}`]: { exists: false } }, { 'prices.PLN': range }],
                },
              ],
            }

      if (typeof minPrice === 'number' && !isNaN(minPrice) && minPrice >= 0) {
        conditions.push(priceRange({ greater_than_equal: minPrice }))
      }

      if (typeof maxPrice === 'number' && !isNaN(maxPrice) && maxPrice >= 0) {
        conditions.push(priceRange({ less_than_equal: maxPrice }))
      }

      const words = searchWords(search)
      const rankedIds = words.length > 0 ? await searchProductIds(payload, words) : undefined
      if (rankedIds) {
        if (rankedIds.length === 0) return findPageInOrder(payload, locale, [], page, limit)
        where.id = { in: rankedIds }
      }

      if (conditions.length > 0) {
        where.and = conditions
      }

      // Payload can only sort by fields, so a search without an explicit sort keeps
      // `searchProductIds`' best-match order: find which ranked products pass the other
      // filters, then page through them in that order.
      if (rankedIds && !safeSort) {
        const { docs: passing } = await payload.find({
          collection: 'products',
          locale,
          where,
          select: { slug: true },
          depth: 0,
          pagination: false,
        })
        const passingIds = new Set(passing.map((doc) => doc.id))
        const orderedIds = rankedIds.filter((id) => passingIds.has(id))
        return findPageInOrder(payload, locale, orderedIds, page, limit)
      }

      const result = await payload.find({
        collection: 'products',
        locale,
        where,
        page,
        limit,
        sort: safeSort ?? '-createdAt',
        depth: 1,
      })

      return {
        docs: result.docs,
        totalDocs: result.totalDocs,
        limit: result.limit,
        totalPages: result.totalPages,
        page: result.page ?? page,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      }
    },
    ['filtered-products'],
    { tags: [PRODUCTS_TAG], revalidate: 300 },
  ),
)
