import React from 'react'
import { getTranslations } from 'next-intl/server'
import { Search } from 'lucide-react'
import { AnimatedResultCount } from '@/components/catalog/animated-result-count'

/** Filter params kept when a new search is submitted (pagination restarts at page 1). */
const PRESERVED_PARAMS = ['category', 'minPrice', 'maxPrice', 'sort'] as const

interface CatalogToolbarProps {
  resultCount: number
  /** Localized listing URL the search form submits to (a GET form, so it works without JS). */
  basePath: string
  searchParams: Record<string, string | undefined>
  /** Rendered below `lg`, where the filter sidebar is hidden (the mobile filters drawer). */
  mobileFilters?: React.ReactNode
}

/** Search form + result count above product listings. */
export async function CatalogToolbar({
  resultCount,
  basePath,
  searchParams,
  mobileFilters,
}: CatalogToolbarProps) {
  const t = await getTranslations('products.toolbar')

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-card">
      <form
        action={basePath}
        method="get"
        role="search"
        className="relative min-w-0 flex-1 basis-52"
      >
        {PRESERVED_PARAMS.map((name) =>
          searchParams[name] ? (
            <input key={name} type="hidden" name={name} value={searchParams[name]} />
          ) : null,
        )}
        <label htmlFor="catalog-search" className="sr-only">
          {t('searchLabel')}
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-500"
          aria-hidden
        />
        <input
          id="catalog-search"
          type="search"
          name="q"
          defaultValue={searchParams.q ?? ''}
          maxLength={100}
          placeholder={t('searchPlaceholder')}
          className="h-11 w-full rounded-xl border border-transparent bg-slate-100 pr-24 pl-10 text-sm text-navy-900 placeholder:text-slate-500 focus:border-brand-400 focus:bg-white focus:outline-none"
        />
        <button
          type="submit"
          className="absolute top-1/2 right-1.5 h-8 -translate-y-1/2 cursor-pointer rounded-lg bg-navy-900 px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
        >
          {t('submit')}
        </button>
      </form>

      {mobileFilters && <div className="lg:hidden">{mobileFilters}</div>}

      <AnimatedResultCount text={t('resultCount', { count: resultCount })} count={resultCount} />
    </div>
  )
}
