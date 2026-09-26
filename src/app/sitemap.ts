import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { getPathname } from '@/i18n/navigation'
import { getAllProductSlugsWithDates } from '@/lib/data/products'
import { getCategories } from '@/lib/data/categories'
import { SITE_URL } from '@/lib/site'

const STATIC_PATHNAMES = ['/', '/products', '/category', '/contact'] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of routing.locales) {
    for (const pathname of STATIC_PATHNAMES) {
      entries.push({
        url: `${SITE_URL}${getPathname({ locale, href: pathname })}`,
        lastModified: new Date(),
      })
    }

    const [productSlugs, categories] = await Promise.all([
      getAllProductSlugsWithDates(locale),
      getCategories(locale, 0),
    ])

    for (const { slug, updatedAt } of productSlugs) {
      entries.push({
        url: `${SITE_URL}${getPathname({ locale, href: { pathname: '/products/[slug]', params: { slug } } })}`,
        lastModified: updatedAt ? new Date(updatedAt) : new Date(),
      })
    }

    for (const category of categories) {
      entries.push({
        url: `${SITE_URL}${getPathname({ locale, href: { pathname: '/category/[slug]', params: { slug: category.slug } } })}`,
        lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
      })
    }
  }

  return entries
}
