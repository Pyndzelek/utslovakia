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
export async function getCategories(locale: Locale): Promise<Category[]> {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'categories',
    locale,
    where: { status: { equals: 'active' } },
    sort: 'order',
    depth: 1, // populate the `image` upload relation (Media doc instead of an ID)
    pagination: false,
  })

  return docs
}
