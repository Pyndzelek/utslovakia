import { getPayload } from 'payload'
import config from '@payload-config'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import type { Locale } from '@/i18n/routing'
import { HOME_PAGE_TAG } from '@/globals/HomePage'
import { getMediaUrl } from '@/lib/utils'

export interface HeroSlide {
  word: string
  productTitle: string
  productSlug: string
  brand: string | null
  imageUrl: string
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
        slug: 'home-page',
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

        return [
          {
            word: slide.word,
            productTitle: product.title,
            productSlug: product.slug,
            brand: typeof product.brand === 'object' ? (product.brand?.name ?? null) : null,
            imageUrl,
            category: { name: category.name, slug: category.slug },
          },
        ]
      })
    },
    ['hero-slides'],
    { tags: [HOME_PAGE_TAG, 'products', 'categories'], revalidate: 3600 },
  ),
)
