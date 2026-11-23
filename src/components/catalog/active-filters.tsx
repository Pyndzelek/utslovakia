import React from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import { FilterChips, type FilterChip } from '@/components/catalog/filter-chips'
import { buildListingHref, toQueryRecord, type CatalogParams } from '@/lib/catalog-params'
import { currencyForLocale } from '@/lib/currency'
import { cn } from '@/lib/utils'

interface Named {
  id: number
  name: string
}

interface ActiveFiltersProps {
  /** Already-locale-resolved pathname of the listing, e.g. from `getPathname(...)`. */
  basePath: string
  params: CatalogParams
  /** Names for the ids in the URL; ids without a match (stale links) get no chip. */
  categories?: Named[]
  brands?: Named[]
  className?: string
}

/**
 * One removable chip per active filter (and the search term), above the product grid — so
 * what narrows the list is visible without opening the sidebar or the mobile drawer.
 * Renders nothing when the listing isn't narrowed.
 */
export async function ActiveFilters({
  basePath,
  params,
  categories = [],
  brands = [],
  className,
}: ActiveFiltersProps) {
  const t = await getTranslations('products.filters')
  const tBadge = await getTranslations('product.badge')
  const currency = currencyForLocale(await getLocale())
  const query = toQueryRecord(params)

  const chips: FilterChip[] = []
  const add = (key: string, label: string, without: Record<string, string | undefined>) =>
    chips.push({
      key,
      label,
      removeLabel: t('removeFilter', { name: label }),
      href: buildListingHref(basePath, { ...query, ...without }),
    })
  /** `ids` minus one, as the comma-separated param value (`undefined` drops the param). */
  const withoutId = (ids: number[], id: number) =>
    ids.filter((other) => other !== id).join(',') || undefined

  if (params.q) add('q', t('searchChip', { query: params.q }), { q: undefined })

  for (const id of params.categoryIds) {
    const category = categories.find((item) => item.id === id)
    if (category) {
      add(`category-${id}`, category.name, { category: withoutId(params.categoryIds, id) })
    }
  }
  for (const id of params.brandIds) {
    const brand = brands.find((item) => item.id === id)
    if (brand) add(`brand-${id}`, brand.name, { brand: withoutId(params.brandIds, id) })
  }
  if (params.inStock) add('stock', t('inStockOnly'), { stock: undefined })
  for (const badge of params.badges) {
    add(`badge-${badge}`, tBadge(badge), {
      badge: params.badges.filter((other) => other !== badge).join(',') || undefined,
    })
  }
  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    const { minPrice: min, maxPrice: max } = params
    const label =
      min !== undefined && max !== undefined
        ? t('priceRangeChip', { min, max, currency })
        : min !== undefined
          ? t('priceFromChip', { min, currency })
          : t('priceToChip', { max: max ?? 0, currency })
    add('price', label, { minPrice: undefined, maxPrice: undefined })
  }

  if (chips.length === 0) return null

  return (
    <div className={cn(className)}>
      <FilterChips
        chips={chips}
        label={t('activeLabel')}
        // Clearing everything keeps the sort order, like the sidebar's reset.
        clearAll={{ label: t('clearAll'), href: buildListingHref(basePath, { sort: query.sort }) }}
      />
    </div>
  )
}
