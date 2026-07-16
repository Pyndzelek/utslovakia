'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
import type { Product } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

/** Horizontal scroll-snap carousel of product cards with arrow controls. */
export function ProductRail({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScroll, setCanScroll] = useState({ left: false, right: false })

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    setCanScroll({
      left: el.scrollLeft > 8,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 8,
    })
  }, [])

  useEffect(() => {
    updateArrows()
    window.addEventListener('resize', updateArrows)
    return () => window.removeEventListener('resize', updateArrows)
  }, [updateArrows])

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className="group/rail relative">
      <div
        ref={scrollerRef}
        onScroll={updateArrows}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pt-1 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            className="w-[70vw] shrink-0 snap-start sm:w-[42vw] md:w-[30vw] lg:w-[255px]"
          />
        ))}
      </div>

      {(['left', 'right'] as const).map((side) => {
        const enabled = canScroll[side]
        return (
          <button
            key={side}
            type="button"
            aria-label={side === 'left' ? 'Scroll back' : 'Scroll forward'}
            onClick={() => scrollBy(side === 'left' ? -1 : 1)}
            className={cn(
              'absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-navy-900 shadow-lift transition-all hover:bg-navy-900 hover:text-white lg:flex',
              side === 'left' ? '-left-5' : '-right-5',
              enabled ? 'opacity-0 group-hover/rail:opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            {side === 'left' ? (
              <ChevronLeft className="size-5" aria-hidden />
            ) : (
              <ChevronRight className="size-5" aria-hidden />
            )}
          </button>
        )
      })}
    </div>
  )
}
