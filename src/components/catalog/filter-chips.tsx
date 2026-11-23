'use client'

import React from 'react'
import { X } from 'lucide-react'
import { useCatalogNavigation } from '@/components/catalog/catalog-transition'

export interface FilterChip {
  key: string
  label: string
  /** Accessible name of the remove action, e.g. "Remove filter: Monitors". */
  removeLabel: string
  /** The listing URL without this filter. */
  href: string
}

/**
 * Removable chips for the filters narrowing a listing. Real links (they work without
 * JavaScript); with it, removal runs inside the listing's transition like the sidebar does.
 */
export function FilterChips({
  chips,
  label,
  clearAll,
}: {
  chips: FilterChip[]
  /** Accessible name of the list. */
  label: string
  /** "Clear all" link, shown from two chips up. */
  clearAll?: { label: string; href: string }
}) {
  const { navigate } = useCatalogNavigation()

  const soft = (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Leave modified clicks (new tab/window) to the browser.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return
    }
    event.preventDefault()
    navigate(href)
  }

  return (
    <ul aria-label={label} className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <li key={chip.key}>
          <a
            href={chip.href}
            onClick={soft(chip.href)}
            aria-label={chip.removeLabel}
            className="group inline-flex h-8 items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 pr-2 pl-3 text-xs font-medium text-brand-800 transition-colors hover:border-brand-400 hover:bg-brand-100"
          >
            <span className="max-w-48 truncate">{chip.label}</span>
            <X
              className="size-3.5 shrink-0 text-brand-600 transition-colors group-hover:text-brand-800"
              aria-hidden
            />
          </a>
        </li>
      ))}
      {clearAll && chips.length > 1 && (
        <li>
          <a
            href={clearAll.href}
            onClick={soft(clearAll.href)}
            className="inline-flex h-8 items-center rounded-full px-2 text-xs font-medium text-slate-500 underline-offset-2 transition-colors hover:text-brand-700 hover:underline"
          >
            {clearAll.label}
          </a>
        </li>
      )}
    </ul>
  )
}
