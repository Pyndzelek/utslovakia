import { getPayload } from 'payload'
import config from '@payload-config'
import type { Locale } from '@/i18n/routing'

/**
 * Data access for the `products` Payload collection.
 *
 * Only what's needed today lives here (category counts for the categories
 * page). Add more `get*` functions to this file the same way `getCategories`
 * was written, following the same Local API + typed-return shape.
 */

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
