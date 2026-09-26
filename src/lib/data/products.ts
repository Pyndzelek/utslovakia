import { getPayload, Where, WhereField } from 'payload'
import config from '@payload-config'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import type { Locale } from '@/i18n/routing'
import { Product } from '@/payload-types'
import { currencyForLocale } from '@/lib/currency'

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

/**
 * Maps every locale to this product's slug in that locale (the `slug` field
 * is localized). Used only to build hreflang alternate links.
 */
export const getProductSlugsByLocale = cache(
  unstable_cache(
    async (id: number): Promise<Partial<Record<Locale, string>>> => {
      const payload = await getPayload({ config })
      const doc = await payload.findByID({
        collection: 'products',
        id,
        locale: 'all',
        depth: 0,
        select: { slug: true },
      })
      return doc.slug as unknown as Partial<Record<Locale, string>>
    },
    ['product-slugs-by-locale'],
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
  /** Field sorting (e.g., '-createdAt', 'price', '-price', 'title') */
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
        sort = '-createdAt',
        status = 'published',
      } = options

      const payload = await getPayload({ config })

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

      const priceConditions: Where[] = []

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
                  and: [
                    { [`prices.${currency}`]: { exists: false } },
                    { 'prices.PLN': range },
                  ],
                },
              ],
            }

      if (typeof minPrice === 'number' && !isNaN(minPrice) && minPrice >= 0) {
        priceConditions.push(priceRange({ greater_than_equal: minPrice }))
      }

      if (typeof maxPrice === 'number' && !isNaN(maxPrice) && maxPrice >= 0) {
        priceConditions.push(priceRange({ less_than_equal: maxPrice }))
      }

      if (priceConditions.length > 0) {
        where.and = priceConditions
      }

      const result = await payload.find({
        collection: 'products',
        locale,
        where,
        page,
        limit,
        sort,
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
