import React from 'react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  /** Already-locale-resolved pathname, e.g. from `getPathname(...)`. */
  basePath: string
  /** Current filter/search params (e.g. category, minPrice) to preserve across page links — `page` is set per-link, so it can be included or omitted here. */
  searchParams?: Record<string, string | undefined>
  pages: number
  current?: number
}

function hrefForPage(
  basePath: string,
  searchParams: Record<string, string | undefined>,
  page: number,
) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === 'page' || !value) continue
    params.set(key, value)
  }
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

export async function Pagination({
  basePath,
  searchParams = {},
  pages = 1,
  current = 1,
}: PaginationProps) {
  const t = await getTranslations('products.pagination')

  if (pages <= 1) return null

  // Window: first, last, and up to 1 neighbor on each side of `current`.
  const pageNumbers = Array.from(new Set([1, current - 1, current, current + 1, pages]))
    .filter((page) => page >= 1 && page <= pages)
    .sort((a, b) => a - b)

  return (
    <nav aria-label={t('label')} className="flex items-center justify-center gap-1.5">
      <Link
        href={hrefForPage(basePath, searchParams, current - 1)}
        aria-label={t('previous')}
        aria-disabled={current === 1}
        tabIndex={current === 1 ? -1 : undefined}
        className={cn(
          'flex size-10 items-center justify-center rounded-full border border-line bg-white text-navy-900 transition-colors hover:border-brand-400',
          current === 1 && 'pointer-events-none opacity-40',
        )}
      >
        <ChevronLeft className="size-4" aria-hidden />
      </Link>

      {pageNumbers.map((page, index) => {
        const prevPage = pageNumbers[index - 1]
        const showEllipsis = prevPage !== undefined && page - prevPage > 1

        return (
          <React.Fragment key={page}>
            {showEllipsis && <span className="px-1 text-slate-400">…</span>}
            <Link
              href={hrefForPage(basePath, searchParams, page)}
              aria-current={page === current ? 'page' : undefined}
              className={cn(
                'flex size-10 items-center justify-center rounded-full text-sm font-medium transition-colors',
                page === current
                  ? 'bg-navy-900 text-white'
                  : 'border border-line bg-white text-slate-600 hover:border-brand-400 hover:text-brand-700',
              )}
            >
              {page}
            </Link>
          </React.Fragment>
        )
      })}

      <Link
        href={hrefForPage(basePath, searchParams, current + 1)}
        aria-label={t('next')}
        aria-disabled={current === pages}
        tabIndex={current === pages ? -1 : undefined}
        className={cn(
          'flex size-10 items-center justify-center rounded-full border border-line bg-white text-navy-900 transition-colors hover:border-brand-400',
          current === pages && 'pointer-events-none opacity-40',
        )}
      >
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </nav>
  )
}
