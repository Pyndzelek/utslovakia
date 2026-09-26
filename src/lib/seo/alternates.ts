import { getPathname } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'

/** `alternates.languages` value: one URL per locale plus `x-default` (the default locale's URL). */
type AlternateLanguages = Partial<Record<Locale | 'x-default', string>>

/** Static, non-parameterized routes that need `alternates.languages`. */
type StaticPathname = '/' | '/products' | '/category' | '/contact'

/** Dynamic `[slug]` routes that need per-locale, per-document `alternates.languages`. */
type DynamicPathname = '/products/[slug]' | '/category/[slug]'

function withDefault(languages: Partial<Record<Locale, string>>): AlternateLanguages {
  const fallback = languages[routing.defaultLocale]
  return fallback ? { ...languages, 'x-default': fallback } : languages
}

/** Builds `alternates.languages` for a static route, one entry per locale. */
export function buildStaticLanguageAlternates(pathname: StaticPathname): AlternateLanguages {
  return withDefault(
    Object.fromEntries(
      routing.locales.map((locale) => [locale, getPathname({ locale, href: pathname })]),
    ),
  )
}

/**
 * Builds `alternates.languages` for a dynamic `[slug]` route. Pass a single slug when
 * it's shared by all locales (products), or a per-locale map when the `slug` field is
 * localized (categories, via `getCategorySlugsByLocale`); locales without a slug are skipped.
 */
export function buildDynamicLanguageAlternates(
  pathname: DynamicPathname,
  slugs: string | Partial<Record<Locale, string | null>>,
): AlternateLanguages {
  return withDefault(
    Object.fromEntries(
      routing.locales.flatMap((locale) => {
        const slug = typeof slugs === 'string' ? slugs : slugs[locale]
        return slug ? [[locale, getPathname({ locale, href: { pathname, params: { slug } } })]] : []
      }),
    ),
  )
}
