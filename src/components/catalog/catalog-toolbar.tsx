import React from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Select } from '@/components/ui/field'

/** Search + sort toolbar above product listings — visual only. */
export function CatalogToolbar({ resultCount }: { resultCount: number }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-3 shadow-card">
      <div className="relative min-w-0 flex-1 basis-52">
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search in results…"
          className="h-11 w-full rounded-xl border border-transparent bg-slate-100 pr-4 pl-10 text-sm text-navy-900 placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:outline-none"
        />
      </div>

      <p className="hidden text-sm whitespace-nowrap text-slate-400 md:block">
        <span className="font-semibold text-navy-900">{resultCount}</span> products
      </p>

      <Select defaultValue="popular" aria-label="Sort by" className="w-44">
        <option value="popular">Most popular</option>
        <option value="newest">Newest first</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </Select>

      <button
        type="button"
        className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-line px-4 text-sm font-medium text-navy-900 transition-colors hover:border-brand-400 hover:text-brand-700 lg:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden />
        Filters
      </button>
    </div>
  )
}
