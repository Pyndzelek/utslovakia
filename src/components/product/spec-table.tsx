import React from 'react'
import type { ProductSpec } from '@/lib/mock-data'

export function SpecTable({ specs }: { specs: ProductSpec[] }) {
  return (
    <dl className="overflow-hidden rounded-2xl border border-line bg-white">
      {specs.map((spec, index) => (
        <div
          key={spec.label}
          className={
            index % 2 === 0
              ? 'grid grid-cols-1 gap-1 bg-slate-50/70 px-5 py-3.5 sm:grid-cols-[220px_1fr] sm:gap-6'
              : 'grid grid-cols-1 gap-1 px-5 py-3.5 sm:grid-cols-[220px_1fr] sm:gap-6'
          }
        >
          <dt className="text-sm font-medium text-slate-500">{spec.label}</dt>
          <dd className="text-sm font-medium text-navy-900">{spec.value}</dd>
        </div>
      ))}
    </dl>
  )
}
