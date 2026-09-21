import { getPathname } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'

type AlternateLanguages = Partial<Record<Locale, string>>

/** Static, non-parameterized routes that need `alternates.languages`. */
type StaticPathname = '/' | '/products' | '/category' | '/contact'

/** Dynamic `[slug]` routes that need per-locale, per-document `alternates.languages`. */
type DynamicPathname = '/products/[slug]' | '/category/[slug]'

/** Builds `alternates.languages` for a static route, one entry per locale. */
export function buildStaticLanguageAlternates(pathname: StaticPathname): AlternateLanguages {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, getPathname({ locale, href: pathname })]),
  )
}

/**
 * Builds `alternates.languages` for a dynamic `[slug]` route from a map of
 * per-locale slugs (e.g. `getCategorySlugsByLocale`/`getProductSlugsByLocale`),
 * since the `slug` field is localized and can differ per locale.
 */
export function buildDynamicLanguageAlternates(
  pathname: DynamicPathname,
  slugsByLocale: AlternateLanguages,
): AlternateLanguages {
  return Object.fromEntries(
    (Object.entries(slugsByLocale) as [Locale, string | undefined][])
      .filter((entry): entry is [Locale, string] => Boolean(entry[1]))
      .map(([locale, slug]) => [locale, getPathname({ locale, href: { pathname, params: { slug } } })]),
  )
}
