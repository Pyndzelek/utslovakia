'use client'

import React, { useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { Checkbox, Input } from '@/components/ui/field'
import { useCatalogNavigation } from '@/components/catalog/catalog-transition'
import {
  BADGE_OPTIONS,
  IN_STOCK_VALUE,
  activeFilterCount,
  parseCatalogParams,
} from '@/lib/catalog-params'
import { cn } from '@/lib/utils'
import { currencyForLocale } from '@/lib/currency'
import type { BrandOption } from '@/lib/data/brands'
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
      className="group border-b border-line py-5 first:pt-0 last:border-b-0 last:pb-0"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-md [&::-webkit-details-marker]:hidden">
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
      {count !== undefined && <span className="text-xs text-slate-500 tabular-nums">{count}</span>}
    </label>
  )
}

/** Adds or removes `id` from a comma-separated id list param. */
function toggleInList(
  params: URLSearchParams,
  name: string,
  current: readonly string[],
  id: string,
) {
  const next = current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
  if (next.length > 0) params.set(name, next.join(','))
  else params.delete(name)
}

export function FilterSidebar({
  categories = [],
  brands = [],
  productCounts,
  showCategoryFilter = true,
  showTitle = true,
  className,
}: {
  categories?: Category[]
  /** Brands with published products; the group is hidden when there are none. */
  brands?: BrandOption[]
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
  const tBadge = useTranslations('product.badge')
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { navigate, search } = useCatalogNavigation()

  const active = parseCatalogParams(Object.fromEntries(new URLSearchParams(search)))
  const hasActiveFilters = activeFilterCount(active) > 0

  // Filters apply to the currency shown for this locale (see getFilteredProducts).
  const currency = currencyForLocale(useLocale())
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '')

  // Keep inputs in sync when the URL changes from outside the sidebar (e.g. a removed
  // filter chip, the empty state's "clear filters" link, or browser back/forward).
  const [syncedParams, setSyncedParams] = useState(searchParams)
  if (searchParams !== syncedParams) {
    setSyncedParams(searchParams)
    setMinPrice(searchParams.get('minPrice') ?? '')
    setMaxPrice(searchParams.get('maxPrice') ?? '')
  }

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(search)
    mutate(params)
    params.delete('page') // any filter change resets pagination
    const query = params.toString()
    navigate(query ? `${pathname}?${query}` : pathname)
  }

  function applyPrice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // "500 – 100" is almost certainly the two fields swapped, not an empty range.
    let [min, max] = [minPrice.trim(), maxPrice.trim()]
    if (min && max && Number(min) > Number(max)) [min, max] = [max, min]
    setMinPrice(min)
    setMaxPrice(max)
    pushParams((params) => {
      if (min) params.set('minPrice', min)
      else params.delete('minPrice')

      if (max) params.set('maxPrice', max)
      else params.delete('maxPrice')
    })
  }

  function reset() {
    setMinPrice('')
    setMaxPrice('')
    // Clearing filters keeps the current search term and sort order.
    const current = new URLSearchParams(search)
    const kept = new URLSearchParams()
    for (const name of ['q', 'sort']) {
      const value = current.get(name)
      if (value) kept.set(name, value)
    }
    const query = kept.toString()
    navigate(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <aside className={cn('rounded-2xl border border-line bg-white p-5 shadow-card', className)}>
      <div className="mb-4 flex min-h-5 items-center justify-between">
        <h2
          className={cn(
            'font-display text-base font-semibold text-navy-900',
            !showTitle && 'sr-only',
          )}
        >
          {t('title')}
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={reset}
            className="flex cursor-pointer items-center gap-1.5 rounded-md text-xs font-medium text-slate-500 transition-colors hover:text-brand-600"
          >
            <RotateCcw className="size-3" aria-hidden />
            {t('reset')}
          </button>
        )}
      </div>

      {showCategoryFilter && categories.length > 0 && (
        <FilterGroup title={t('category')}>
          <div className="flex flex-col">
            {categories.map((category) => (
              <CheckRow
                key={category.id}
                label={category.name}
                count={productCounts?.[category.id] ?? 0}
                checked={active.categoryIds.includes(category.id)}
                onChange={() =>
                  pushParams((params) =>
                    toggleInList(
                      params,
                      'category',
                      active.categoryIds.map(String),
                      String(category.id),
                    ),
                  )
                }
              />
            ))}
          </div>
        </FilterGroup>
      )}

      {brands.length > 0 && (
        <FilterGroup title={t('brand')}>
          <div className="-mr-2 flex max-h-64 flex-col overflow-y-auto pr-2">
            {brands.map((brand) => (
              <CheckRow
                key={brand.id}
                label={brand.name}
                count={brand.count}
                checked={active.brandIds.includes(brand.id)}
                onChange={() =>
                  pushParams((params) =>
                    toggleInList(params, 'brand', active.brandIds.map(String), String(brand.id)),
                  )
                }
              />
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title={t('availability')}>
        <CheckRow
          label={t('inStockOnly')}
          checked={active.inStock}
          onChange={() =>
            pushParams((params) => {
              if (active.inStock) params.delete('stock')
              else params.set('stock', IN_STOCK_VALUE)
            })
          }
        />
      </FilterGroup>

      <FilterGroup title={t('badge')}>
        <div className="flex flex-col">
          {BADGE_OPTIONS.map((badge) => (
            <CheckRow
              key={badge}
              label={tBadge(badge)}
              checked={active.badges.includes(badge)}
              onChange={() =>
                pushParams((params) => toggleInList(params, 'badge', active.badges, badge))
              }
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title={`${t('price')} (${currency})`}>
        {/* A form, so Enter in either field applies the range. */}
        <form onSubmit={applyPrice}>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder={t('priceFrom')}
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              className="h-10"
              aria-label={t('priceFromAria')}
            />
            <span className="text-slate-400" aria-hidden>
              –
            </span>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder={t('priceTo')}
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="h-10"
              aria-label={t('priceToAria')}
            />
          </div>
          <button
            type="submit"
            className="mt-3 w-full cursor-pointer rounded-full border border-line py-2 text-xs font-semibold text-navy-900 transition-colors hover:border-brand-400 hover:text-brand-700"
          >
            {t('applyPrice')}
          </button>
        </form>
      </FilterGroup>
    </aside>
  )
}
