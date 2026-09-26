import { routing, type Locale } from '@/i18n/routing'

/**
 * Plain-text meta description from free-form content: whitespace collapsed and cut at a
 * word boundary to ~155 chars, the length search results show before truncating.
 */
export function metaDescription(text: string | null | undefined, max = 155): string | undefined {
  const plain = text?.replace(/\s+/g, ' ').trim()
  if (!plain) return undefined
  if (plain.length <= max) return plain
  const cut = plain.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, '')}…`
}

/** Open Graph `locale` values (language_TERRITORY). */
const ogLocales: Record<Locale, string> = {
  pl: 'pl_PL',
  en: 'en_US',
  sk: 'sk_SK',
  'pt-br': 'pt_BR',
}

/**
 * Site-wide Open Graph fields. Next.js replaces (doesn't merge) a page's `openGraph`
 * with the layout's, so pages that set their own must spread this in too.
 */
export function ogDefaults(locale: Locale) {
  return {
    siteName: 'UTSlovakia',
    locale: ogLocales[locale],
    alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => ogLocales[l]),
  }
}
