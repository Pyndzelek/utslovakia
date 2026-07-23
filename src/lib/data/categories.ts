import { getPayload } from 'payload'
import config from '@payload-config'
import type { Locale } from '@/i18n/routing'
import type { Category } from '@/payload-types'

/**
 * Data access for the `categories` Payload collection.
 *
 * Uses the Payload Local API (direct DB access, no HTTP round-trip) since
 * Payload runs inside this Next.js app. Errors are deliberately not caught:
 * a failed query throws and surfaces in the nearest Next.js error boundary.
 *
 * To fetch another collection elsewhere, copy this file into `src/lib/data/`
 * and swap the collection slug, return type and query options.
 */
export async function getCategories(locale: Locale, depth: 0 | 1 = 1): Promise<Category[]> {
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
}

/**
 * A single category by its (locale-specific) slug, or `null` if none matches.
 * Returning `null` — rather than throwing — lets the caller decide whether
 * that means `notFound()` or something else; genuine query failures still throw.
 */
export async function getCategoryBySlug(slug: string, locale: Locale): Promise<Category | null> {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'categories',
    locale,
    where: { slug: { equals: slug }, status: { equals: 'active' } },
    depth: 1, // populate `image` for the category hero
    limit: 1,
  })

  return docs[0] ?? null
}

/**
 * Maps every locale to this category's slug in that locale (the `slug` field
 * is localized, so each locale can have a different URL segment). Used only
 * to build hreflang alternate links; everything else in the app works with a
 * single resolved locale via `getCategoryBySlug`/`getCategories`.
 */
export async function getCategorySlugsByLocale(id: number): Promise<Partial<Record<Locale, string>>> {
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
}
