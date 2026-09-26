import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { getAllProductSlugsWithDates } from '@/lib/data/products'
import { getCategories, getCategorySlugsByLocale } from '@/lib/data/categories'
import { buildDynamicLanguageAlternates, buildStaticLanguageAlternates } from '@/lib/seo/alternates'
import { SITE_URL } from '@/lib/site'

const STATIC_PATHNAMES = ['/', '/products', '/category', '/contact'] as const

type Languages = Record<string, string>

const absolute = (languages: Partial<Languages>): Languages =>
  Object.fromEntries(
    Object.entries(languages)
      .filter((entry): entry is [string, string] => Boolean(entry[1]))
      .map(([lang, path]) => [lang, `${SITE_URL}${path}`]),
  )

/**
 * One entry per locale URL, each listing every language version (incl. x-default) so
 * search engines tie the translations together.
 */
function entriesFor(languages: Languages, lastModified: Date): MetadataRoute.Sitemap {
  return Object.entries(languages)
    .filter(([lang]) => lang !== 'x-default')
    .map(([, url]) => ({ url, lastModified, alternates: { languages } }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = STATIC_PATHNAMES.flatMap((pathname) =>
    entriesFor(absolute(buildStaticLanguageAlternates(pathname)), now),
  )

  // Product slugs aren't localized: one slug, one URL per locale.
  const products = await getAllProductSlugsWithDates(routing.defaultLocale)
  for (const { slug, updatedAt } of products) {
    const languages = absolute(buildDynamicLanguageAlternates('/products/[slug]', slug))
    entries.push(...entriesFor(languages, updatedAt ? new Date(updatedAt) : now))
  }

  // Category slugs are localized.
  const categories = await getCategories(routing.defaultLocale, 0)
  for (const category of categories) {
    const slugs = await getCategorySlugsByLocale(category.id)
    const languages = absolute(buildDynamicLanguageAlternates('/category/[slug]', slugs))
    entries.push(...entriesFor(languages, category.updatedAt ? new Date(category.updatedAt) : now))
  }

  return entries
}
