import React from 'react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { PackageSearch, RotateCcw } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CatalogEmptyStateProps {
  /** Already-locale-resolved pathname of the listing, e.g. from `getPathname(...)` — used as the "clear filters" target. */
  basePath: string
  /** Whether any filter (category, price, page) is narrowing the listing. Switches the copy between "nothing matches" and "nothing here yet". */
  hasFilters: boolean
  className?: string
}

/** Shown in place of the product grid when a listing returns no products. */
export async function CatalogEmptyState({
  basePath,
  hasFilters,
  className,
}: CatalogEmptyStateProps) {
  const t = await getTranslations('products.empty')

  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-2xl border border-dashed border-line bg-white px-6 py-16 text-center',
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <PackageSearch className="size-6" aria-hidden />
      </div>
      <h2 className="mt-5 font-display text-lg font-semibold text-navy-900">
        {hasFilters ? t('filteredTitle') : t('title')}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {hasFilters ? t('filteredDescription') : t('description')}
      </p>
      {hasFilters && (
        <Link
          href={basePath}
          scroll={false}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-6')}
        >
          <RotateCcw aria-hidden />
          {t('clearFilters')}
        </Link>
      )}
    </div>
  )
}
