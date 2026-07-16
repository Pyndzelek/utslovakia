import React from 'react'
import { getTranslations } from 'next-intl/server'
import { Search } from 'lucide-react'

/** Search + sort toolbar above product listings — visual only. */
export async function CatalogToolbar({ resultCount }: { resultCount: number }) {
  const t = await getTranslations('products.toolbar')

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-card">
      <div className="relative min-w-0 flex-1 basis-52">
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="search"
          placeholder={t('searchPlaceholder')}
          className="h-11 w-full rounded-xl border border-transparent bg-slate-100 pr-4 pl-10 text-sm text-navy-900 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none"
        />
      </div>

      <p className="hidden text-sm whitespace-nowrap text-slate-400 md:block">
        {t('resultCount', { count: resultCount })}
      </p>
    </div>
  )
}
