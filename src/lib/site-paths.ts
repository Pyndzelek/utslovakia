import { routing, type Locale, type Pathnames } from '@/i18n/routing'
import { SITE_URL } from '@/lib/site'

/**
 * Absolute public URL of a page in `locale`, built from the route table in
 * `src/i18n/routing.ts`. For code that runs outside the Next.js request cycle — the Payload
 * config (admin "preview" links) and CLI scripts — where `@/i18n/navigation`'s `getPathname`
 * (which pulls in `next/navigation`) must not be imported.
 */
export function publicUrl(locale: string, pathname: Pathnames, slug?: string): string {
  const resolvedLocale = (routing.locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : routing.defaultLocale
  const template = routing.pathnames[pathname]
  const localized = typeof template === 'string' ? template : template[resolvedLocale]
  const path = slug ? localized.replace('[slug]', encodeURIComponent(slug)) : localized
  // `localePrefix: 'as-needed'`: the default locale has no prefix.
  const prefix = resolvedLocale === routing.defaultLocale ? '' : `/${resolvedLocale}`
  return `${SITE_URL}${prefix}${path === '/' ? '' : path}` || SITE_URL
}
