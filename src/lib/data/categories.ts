import { getPayload } from 'payload'
import config from '@payload-config'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { routing, type Locale } from '@/i18n/routing'
import type { Category } from '@/payload-types'

/**
 * Data access for the `categories` Payload collection.
 *
 * Uses the Payload Local API (direct DB access, no HTTP round-trip) since
 * Payload runs inside this Next.js app. Errors are deliberately not caught:
 * a failed query throws and surfaces in the nearest Next.js error boundary.
 *
 * Every export is wrapped in React's `cache()` (per-request dedupe) around
 * `unstable_cache` (cross-request cache, tagged 'categories'). `Category`'s
 * `afterChange`/`afterDelete` hooks (src/collections/Category.ts) call
 * `revalidateTag('categories')` on any change; the `revalidate` values below
 * are just the timed fallback behind that.
 *
 * To fetch another collection elsewhere, copy this file into `src/lib/data/`
 * and swap the collection slug, return type and query options.
 */

const CATEGORIES_TAG = 'categories'

export const getCategories = cache(
  unstable_cache(
    async (locale: Locale, depth: 0 | 1 = 1): Promise<Category[]> => {
      const payload = await getPayload({ config })

      const { docs } = await payload.find({
        collection: 'categories',
        locale,
        where: { status: { equals: 'active' } },
        sort: 'order',
        depth, // 1 populates `image` (Media doc); pass 0 when only name/slug are needed
        pagination: false,
      })

      return docs
    },
    ['categories'],
    { tags: [CATEGORIES_TAG], revalidate: 3600 },
  ),
)

/**
 * A single category by its (locale-specific) slug, or `null` if none matches.
 * Returning `null` — rather than throwing — lets the caller decide whether
 * that means `notFound()` or something else; genuine query failures still throw.
 */
export const getCategoryBySlug = cache(
  unstable_cache(
    async (slug: string, locale: Locale): Promise<Category | null> => {
      const payload = await getPayload({ config })

      const { docs } = await payload.find({
        collection: 'categories',
        locale,
        where: { slug: { equals: slug }, status: { equals: 'active' } },
        depth: 1, // populate `image` for the category hero
        limit: 1,
      })

      return docs[0] ?? null
    },
    ['category-by-slug'],
    { tags: [CATEGORIES_TAG], revalidate: 3600 },
  ),
)

/**
 * Maps every locale to this category's slug in that locale (the `slug` field
 * is localized, so each locale can have a different URL segment). Used only
 * to build hreflang alternate links; everything else in the app works with a
 * single resolved locale via `getCategoryBySlug`/`getCategories`.
 */
export const getCategorySlugsByLocale = cache(
  unstable_cache(
    async (id: number): Promise<Partial<Record<Locale, string>>> => {
      const payload = await getPayload({ config })

      const doc = await payload.findByID({
        collection: 'categories',
        id,
        locale: 'all', // returns each localized field as { pl: '...', en: '...' }
        depth: 0,
        select: { slug: true },
      })

      // Payload's generated types describe `slug` as `string` regardless of the
      // `locale` option, so the `locale: 'all'` shape needs an explicit cast.
      return doc.slug as unknown as Partial<Record<Locale, string>>
    },
    ['category-slugs-by-locale'],
    { tags: [CATEGORIES_TAG], revalidate: 3600 },
  ),
)

/**
 * When `slug` is another locale's slug for an active category, returns that category's
 * slug in `locale` (or `null`). Lets the language switcher keep the current slug: the
 * category page redirects to the right localized URL instead of 404ing.
 */
export async function findCategorySlugInLocale(
  slug: string,
  locale: Locale,
): Promise<string | null> {
  for (const otherLocale of routing.locales) {
    if (otherLocale === locale) continue
    const category = await getCategoryBySlug(slug, otherLocale)
    if (category) return (await getCategorySlugsByLocale(category.id))[locale] ?? null
  }
  return null
}
