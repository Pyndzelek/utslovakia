import { getPayload } from 'payload'
import config from '@payload-config'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import type { Locale } from '@/i18n/routing'
import type { SiteSetting } from '@/payload-types'
import { SITE_SETTINGS_TAG } from '@/globals/SiteSettings'

/**
 * The `site-settings` global (company, contact, FAQ). Same caching pattern as
 * `categories.ts`; the global's `afterChange` hook evicts the tag on save.
 */
export const getSiteSettings = cache(
  unstable_cache(
    async (locale: Locale): Promise<SiteSetting> => {
      const payload = await getPayload({ config })
      return payload.findGlobal({ slug: 'site-settings', locale, depth: 0 })
    },
    ['site-settings'],
    { tags: [SITE_SETTINGS_TAG], revalidate: 3600 },
  ),
)

/** Postal address as display lines: street / "027 44 Tvrdošín" / "Žilinský kraj, Slovensko". */
export function addressLines(address: SiteSetting['address']): string[] {
  return [
    address.street,
    [address.postalCode, address.city].filter(Boolean).join(' '),
    [address.region, address.country].filter(Boolean).join(', '),
  ].filter(Boolean)
}
