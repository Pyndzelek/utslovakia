'use client'

import React from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { useTranslations } from 'next-intl'
import { SlidersHorizontal, X } from 'lucide-react'
import { FilterSidebar } from '@/components/catalog/filter-sidebar'

/**
 * Below `lg` the filter sidebar is hidden; this opens the same filters in a drawer.
 * Base UI's Dialog handles focus trapping, Escape and scroll locking.
 */
export function MobileFilters(props: React.ComponentProps<typeof FilterSidebar>) {
  const t = useTranslations('products.filters')

  return (
    <Dialog.Root>
      <Dialog.Trigger className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-line px-4 text-sm font-semibold text-navy-900 transition-colors hover:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none">
        <SlidersHorizontal className="size-4" aria-hidden />
        {t('open')}
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
            <FilterSidebar {...props} showTitle={false} className="rounded-none border-0 shadow-none" />
          </div>
          <div className="border-t border-line p-4">
            <Dialog.Close className="h-11 w-full cursor-pointer rounded-full bg-navy-900 text-sm font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none">
              {t('showResults')}
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
