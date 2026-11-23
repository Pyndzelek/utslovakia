'use client'

import React, { useId } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Select } from '@/components/ui/field'
import { useCatalogNavigation } from '@/components/catalog/catalog-transition'
import { parseCatalogParams, type SortOption } from '@/lib/catalog-params'

/** Sort orders offered in the dropdown, in display order (the default is added on top). */
const OPTIONS: {
  value: SortOption
  labelKey: 'priceAsc' | 'priceDesc' | 'nameAsc' | 'nameDesc'
}[] = [
  { value: 'price', labelKey: 'priceAsc' },
  { value: '-price', labelKey: 'priceDesc' },
  { value: 'title', labelKey: 'nameAsc' },
  { value: '-title', labelKey: 'nameDesc' },
]

/**
 * Sort order for a product listing, kept in `?sort=`. Without a value the listing uses its
 * default: best match while searching (`searching`), newest first otherwise.
 */
export function SortSelect({ searching, className }: { searching: boolean; className?: string }) {
  const t = useTranslations('products.sort')
  const id = useId()
  const pathname = usePathname()
  const { navigate, search } = useCatalogNavigation()
  const { sort } = parseCatalogParams(Object.fromEntries(new URLSearchParams(search)))

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(search)
    if (event.target.value) params.set('sort', event.target.value)
    else params.delete('sort')
    params.delete('page') // a new order starts from the first page
    const query = params.toString()
    navigate(query ? `${pathname}?${query}` : pathname)
  }

  return (
    <div className={className}>
      <label htmlFor={id} className="sr-only">
        {t('label')}
      </label>
      <Select id={id} value={sort ?? ''} onChange={handleChange}>
        <option value="">{searching ? t('relevance') : t('newest')}</option>
        {/* While searching, "newest" is a real choice instead of the default. */}
        {searching && <option value="-createdAt">{t('newest')}</option>}
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </Select>
    </div>
  )
}
