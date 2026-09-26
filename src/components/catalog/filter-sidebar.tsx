'use client'

import React, { useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { Checkbox, Input } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { currencyForLocale } from '@/lib/currency'
import type { Category } from '@/payload-types'

function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details
      open={defaultOpen}
      className="group border-b border-line py-5 first:pt-0 last:border-b-0"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-semibold text-navy-900">{title}</span>
        <ChevronDown
          className="size-4 text-slate-400 transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  )
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string
  count?: number
  checked: boolean
  onChange: () => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-slate-600 transition-colors hover:text-navy-900">
      <Checkbox checked={checked} onChange={onChange} />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-slate-500">{count}</span>}
    </label>
  )
}

export function FilterSidebar({
  categories = [],
  productCounts,
  showCategoryFilter = true,
  showTitle = true,
  className,
}: {
  categories?: Category[]
  productCounts?: Record<number, number>
  /** Hide the category checkbox group — e.g. on a category detail page, where
   *  the category is already fixed by the URL and re-listing all categories
   *  to filter by would be redundant. */
  showCategoryFilter?: boolean
  /** Hide the "Filters" heading when a surrounding drawer already shows it. */
  showTitle?: boolean
  className?: string
}) {
  const t = useTranslations('products.filters')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeCategoryIds = new Set(
    (searchParams.get('category') ?? '')
      .split(',')
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id)),
  )

  // Filters apply to the currency shown for this locale (see getFilteredProducts).
  const currency = currencyForLocale(useLocale())
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '')

  // Keep inputs in sync when the URL changes from outside the sidebar (e.g. the
  // empty state's "clear filters" link, or browser back/forward).
  const [syncedParams, setSyncedParams] = useState(searchParams)
  if (searchParams !== syncedParams) {
    setSyncedParams(searchParams)
    setMinPrice(searchParams.get('minPrice') ?? '')
    setMaxPrice(searchParams.get('maxPrice') ?? '')
  }

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    params.delete('page') // any filter change resets pagination
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`, {
      scroll: false,
    })
  }

  function toggleCategory(id: number) {
    pushParams((params) => {
      const next = new Set(activeCategoryIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)

      if (next.size > 0) params.set('category', Array.from(next).join(','))
      else params.delete('category')
    })
  }

  function applyPrice() {
    pushParams((params) => {
      if (minPrice) params.set('minPrice', minPrice)
      else params.delete('minPrice')

      if (maxPrice) params.set('maxPrice', maxPrice)
      else params.delete('maxPrice')
    })
  }

  function reset() {
    setMinPrice('')
    setMaxPrice('')
    // Clearing filters keeps the current search term.
    const q = searchParams.get('q')
    router.push(q ? `${pathname}?${new URLSearchParams({ q })}` : pathname, { scroll: false })
  }

  return (
    <aside className={cn('rounded-2xl border border-line bg-white p-5 shadow-card', className)}>
      <div className="mb-1 flex items-center justify-between">
        <h2
          className={cn(
            'font-display text-base font-semibold text-navy-900',
            !showTitle && 'sr-only',
          )}
        >
          {t('title')}
        </h2>
        <button
          type="button"
          onClick={reset}
          className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-brand-600"
        >
          <RotateCcw className="size-3" aria-hidden />
          {t('reset')}
        </button>
      </div>

      {showCategoryFilter && (
        <FilterGroup title={t('category')}>
          <div className="flex flex-col">
            {categories.map((category) => (
              <CheckRow
                key={category.id}
                label={category.name}
                count={productCounts?.[category.id]}
                checked={activeCategoryIds.has(category.id)}
                onChange={() => toggleCategory(category.id)}
              />
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title={`${t('price')} (${currency})`}>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={t('priceFrom')}
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            className="h-10"
            aria-label={t('priceFromAria')}
          />
          <span className="text-slate-400">–</span>
          <Input
            type="number"
            placeholder={t('priceTo')}
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="h-10"
            aria-label={t('priceToAria')}
          />
        </div>
        <button
          type="button"
          onClick={applyPrice}
          className="mt-3 w-full cursor-pointer rounded-full border border-line py-2 text-xs font-semibold text-navy-900 transition-colors hover:border-brand-400 hover:text-brand-700"
        >
          {t('applyPrice')}
        </button>
      </FilterGroup>
    </aside>
  )
}
