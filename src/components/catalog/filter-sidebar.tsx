import React from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { Checkbox, Input } from '@/components/ui/field'
import { brands, categories } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

/** Visual-only filter panel — no filtering logic is wired up yet. */

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
    <details open={defaultOpen} className="group border-b border-line py-5 first:pt-0 last:border-b-0">
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
  defaultChecked,
}: {
  label: string
  count?: number
  defaultChecked?: boolean
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-slate-600 transition-colors hover:text-navy-900">
      <Checkbox defaultChecked={defaultChecked} />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-slate-400">{count}</span>}
    </label>
  )
}

export function FilterSidebar({
  activeCategorySlug,
  className,
}: {
  activeCategorySlug?: string
  className?: string
}) {
  return (
    <aside className={cn('rounded-2xl border border-line bg-white p-5 shadow-card', className)}>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-navy-900">Filters</h2>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-brand-600"
        >
          <RotateCcw className="size-3" aria-hidden />
          Reset
        </button>
      </div>

      <FilterGroup title="Category">
        <div className="flex flex-col">
          {categories.map((category) => (
            <CheckRow
              key={category.slug}
              label={category.name}
              count={category.productCount}
              defaultChecked={category.slug === activeCategorySlug}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Availability">
        <div className="flex flex-col">
          <CheckRow label="In stock" count={94} defaultChecked />
          <CheckRow label="On order" count={21} />
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        <div className="flex items-center gap-2">
          <Input type="number" placeholder="From" defaultValue={0} className="h-10" aria-label="Price from" />
          <span className="text-slate-400">–</span>
          <Input type="number" placeholder="To" defaultValue={1500} className="h-10" aria-label="Price to" />
        </div>
        <button
          type="button"
          className="mt-3 w-full cursor-pointer rounded-full border border-line py-2 text-xs font-semibold text-navy-900 transition-colors hover:border-brand-400 hover:text-brand-700"
        >
          Apply price range
        </button>
      </FilterGroup>

      <FilterGroup title="Brand" defaultOpen={false}>
        <div className="flex flex-col">
          {brands.map((brand) => (
            <CheckRow key={brand} label={brand} />
          ))}
        </div>
      </FilterGroup>
    </aside>
  )
}
