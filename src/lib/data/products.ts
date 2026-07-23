import { getPayload, Where } from 'payload'
import config from '@payload-config'
import type { Locale } from '@/i18n/routing'
import { Product } from '@/payload-types'

/**
 * Data access for the `products` Payload collection.
 *
 * Only what's needed today lives here (category counts for the categories
 * page). Add more `get*` functions to this file the same way `getCategories`
 * was written, following the same Local API + typed-return shape.
 */

export async function getProductsByCategory(
  categoryId: number,
  locale: Locale,
): Promise<Product[]> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    locale,
    where: {
      category: { equals: categoryId }, // <-- Now safely passes an integer ID
    },
    depth: 1,
  })
  return docs
}

/**
 * Counts published products per category in a single query, instead of one
 * `count()` round-trip per category — cheaper when listing many categories.
 */
export async function getProductCountsByCategory(locale: Locale): Promise<Map<number, number>> {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'products',
    locale,
    where: { status: { equals: 'published' } },
    select: { category: true },
    depth: 0, // category comes back as bare ids, which is all we count here
    pagination: false,
  })

  const counts = new Map<number, number>()
  for (const product of docs) {
    for (const category of product.category) {
      const categoryId = typeof category === 'number' ? category : category.id
      counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1)
    }
  }

  return counts
}

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

export async function getFilteredProducts(
  locale: Locale,
  options: GetFilteredProductsOptions = {},
): Promise<PaginatedProductsResult> {
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
        where.category = { in: validIds }
      }
    } else if (typeof categoryIds === 'number' && !isNaN(categoryIds)) {
      where.category = { equals: categoryIds }
    }
  }

  const priceConditions: Where[] = []

  if (typeof minPrice === 'number' && !isNaN(minPrice) && minPrice >= 0) {
    priceConditions.push({ price: { greater_than_equal: minPrice } })
  }

  if (typeof maxPrice === 'number' && !isNaN(maxPrice) && maxPrice >= 0) {
    priceConditions.push({ price: { less_than_equal: maxPrice } })
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
}
