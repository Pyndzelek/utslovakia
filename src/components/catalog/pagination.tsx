import React from 'react'
import { getTranslations } from 'next-intl/server'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Visual-only pagination. */
export async function Pagination({ pages = 6, current = 1 }: { pages?: number; current?: number }) {
  const t = await getTranslations('products.pagination')
  const visible = [1, 2, 3] as const

  return (
    <nav aria-label={t('label')} className="flex items-center justify-center gap-1.5">
      <button
        type="button"
        aria-label={t('previous')}
        disabled={current === 1}
        className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-navy-900 transition-colors hover:border-brand-400 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </button>

      {visible.map((page) => (
        <button
          key={page}
          type="button"
          aria-current={page === current ? 'page' : undefined}
          className={cn(
            'flex size-10 cursor-pointer items-center justify-center rounded-full text-sm font-medium transition-colors',
            page === current
              ? 'bg-navy-900 text-white'
              : 'border border-line bg-white text-slate-600 hover:border-brand-400 hover:text-brand-700',
          )}
        >
          {page}
        </button>
      ))}

      <span className="px-1 text-slate-400">…</span>

      <button
        type="button"
        className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-sm font-medium text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-700"
      >
        {pages}
      </button>

      <button
        type="button"
        aria-label={t('next')}
        className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-navy-900 transition-colors hover:border-brand-400"
      >
        <ChevronRight className="size-4" aria-hidden />
      </button>
    </nav>
  )
}
