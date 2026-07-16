'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ProductBadgeTag } from '@/components/ui/badge'
import type { ProductBadge } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  image: string
  name: string
  badge?: ProductBadge
}

/** Placeholder gallery — repeats the single mock image across four angles. */
export function ProductGallery({ image, name, badge }: ProductGalleryProps) {
  const views = ['Front', 'Side', 'Detail', 'Mounted']
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-slate-50 to-slate-100">
        {badge && <ProductBadgeTag badge={badge} className="absolute top-4 left-4 z-10" />}
        <Image
          key={active}
          src={image}
          alt={`${name} — ${views[active]} view`}
          fill
          priority
          sizes="(max-width: 1024px) 90vw, 560px"
          className="object-contain p-10 animate-in fade-in zoom-in-95 duration-300 sm:p-14"
        />
      </div>

      <div className="mt-3 grid grid-cols-4 gap-3">
        {views.map((view, index) => (
          <button
            key={view}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`${view} view`}
            aria-pressed={active === index}
            className={cn(
              'relative aspect-square cursor-pointer overflow-hidden rounded-xl border bg-gradient-to-br from-slate-50 to-slate-100 transition-all',
              active === index
                ? 'border-brand-600 ring-2 ring-brand-600/20'
                : 'border-line hover:border-brand-300',
            )}
          >
            <Image src={image} alt="" fill sizes="120px" className="object-contain p-3" />
          </button>
        ))}
      </div>
    </div>
  )
}
