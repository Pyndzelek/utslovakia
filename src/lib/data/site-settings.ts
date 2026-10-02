import { getPayload } from 'payload'
import config from '@payload-config'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import type { Locale } from '@/i18n/routing'
import type { SiteSetting } from '@/payload-types'
import { SITE_SETTINGS_TAG } from '@/globals/SiteSettings'
import { formatPrice, resolvePrice } from '@/lib/currency'
import { getMediaUrl } from '@/lib/utils'

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

export interface HeroSlide {
  word: string
  productTitle: string
  productSlug: string
  brand: string | null
  imageUrl: string
  /** Formatted in the locale's currency; `null` when the product has no price set. */
  price: string | null
  category: { name: string; slug: string }
}

/**
 * The home hero's rotating slides, flattened for the client component. Slides whose
 * product is missing, unpublished, without an image or without an active category
 * are dropped. Cached under the products tag too, since product edits change them.
 */
export const getHeroSlides = cache(
  unstable_cache(
    async (locale: Locale): Promise<HeroSlide[]> => {
      const payload = await getPayload({ config })
      // depth 2: slide → product → its images/brand/categories
      const { heroSlides } = await payload.findGlobal({
        slug: 'site-settings',
        locale,
        depth: 2,
        select: { heroSlides: true },
      })

      return (heroSlides ?? []).flatMap((slide) => {
        const product = typeof slide.product === 'object' ? slide.product : null
        if (!product || product.status !== 'published') return []

        const category = product.categories.find(
          (c) => typeof c === 'object' && c.status === 'active',
        )
        const imageUrl =
          getMediaUrl(slide.image, 'gallery') ??
          (typeof product.images[0] === 'object'
            ? getMediaUrl(product.images[0].image, 'gallery')
            : null)
        if (typeof category !== 'object' || !imageUrl) return []

        const { amount, currency } = resolvePrice(product.prices, locale)
        return [
          {
            word: slide.word,
            productTitle: product.title,
            productSlug: product.slug,
            brand: typeof product.brand === 'object' ? (product.brand?.name ?? null) : null,
            imageUrl,
            price: amount > 0 ? formatPrice(amount, currency, locale) : null,
            category: { name: category.name, slug: category.slug },
          },
        ]
      })
    },
    ['hero-slides'],
    { tags: [SITE_SETTINGS_TAG, 'products', 'categories'], revalidate: 3600 },
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
