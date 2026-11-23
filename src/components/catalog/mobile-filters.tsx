'use client'

import React from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { useTranslations } from 'next-intl'
import { SlidersHorizontal, X } from 'lucide-react'
import { FilterSidebar } from '@/components/catalog/filter-sidebar'
import { useCatalogNavigation } from '@/components/catalog/catalog-transition'
import { cn } from '@/lib/utils'

interface MobileFiltersProps extends React.ComponentProps<typeof FilterSidebar> {
  /** Products matching the current filters — shown on the drawer's "show results" button. */
  resultCount: number
  /** Number of active filters — shown as a badge on the trigger. */
  activeCount: number
}

/**
 * Below `lg` the filter sidebar is hidden; this opens the same filters in a drawer.
 * Base UI's Dialog handles focus trapping, Escape and scroll locking.
 */
export function MobileFilters({ resultCount, activeCount, ...props }: MobileFiltersProps) {
  const t = useTranslations('products.filters')
  const { pending } = useCatalogNavigation()

  return (
    <Dialog.Root>
      <Dialog.Trigger className="flex h-11 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl border border-line px-4 text-sm font-semibold text-navy-900 transition-colors hover:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none">
        <SlidersHorizontal className="size-4" aria-hidden />
        {t('open')}
        {activeCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-semibold text-white tabular-nums">
            {activeCount}
          </span>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[998] bg-navy-950/60 backdrop-blur-xs transition-opacity duration-300 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-999 flex w-[min(24rem,90vw)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <Dialog.Title className="font-display text-lg font-semibold text-navy-900">
              {t('title')}
            </Dialog.Title>
            <Dialog.Close
              aria-label={t('close')}
              className="flex size-9 cursor-pointer items-center justify-center rounded-full text-navy-900 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
            >
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto">
            <FilterSidebar
              {...props}
              showTitle={false}
              className="rounded-none border-0 shadow-none"
            />
          </div>
          <div className="border-t border-line p-4">
            <Dialog.Close
              className={cn(
                'h-11 w-full cursor-pointer rounded-full bg-navy-900 text-sm font-semibold text-white transition-[background-color,opacity] hover:bg-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none',
                // The count is still the previous one while a filter change loads.
                pending && 'opacity-70',
              )}
            >
              {t('showResultsCount', { count: resultCount })}
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
