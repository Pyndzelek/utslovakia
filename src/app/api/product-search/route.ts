import { NextResponse, type NextRequest } from 'next/server'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing'
import { searchProductSuggestions } from '@/lib/data/products'

/** Shorter queries match nearly everything, so the dropdown stays closed below this. */
const MIN_QUERY_LENGTH = 2

/**
 * `GET /api/product-search?q=…&locale=…` — the header's search-as-you-type results.
 *
 * A route handler rather than a Server Action: the dropdown aborts stale requests as the
 * visitor types, and Server Actions run one at a time. This static segment takes priority
 * over Payload's `(payload)/api/[...slug]` catch-all.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const query = params.get('q')?.trim() ?? ''
  const requestedLocale = params.get('locale')
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale

  if (query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ results: [], total: 0 })
  }
  return NextResponse.json(await searchProductSuggestions(locale, query))
}
