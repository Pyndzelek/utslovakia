'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
import type { Product } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

/**
 * Horizontal scroll-snap carousel of product cards with arrow controls.
 * - Mobile: first card sits centered with the next card peeking on the right.
 * - Edges fade instead of clipping cards mid-way.
 * - Cards fade/slide into view the first time they enter the rail.
 */
export function ProductRail({ products }: { products: Product[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])
  const [canScroll, setCanScroll] = useState({ left: false, right: false })
  const [visible, setVisible] = useState<boolean[]>(() => products.map(() => false))
  const [activeIndex, setActiveIndex] = useState(0)

  const handleScroll = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return

    // 1. Update arrow visibility
    setCanScroll({
      left: el.scrollLeft > 8,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - 8,
    })

    // 2. Calculate active index for the mobile dots indicator
    const center = el.scrollLeft + el.clientWidth / 2
    let closestIndex = 0
    let minDistance = Infinity

    cardRefs.current.forEach((card, index) => {
      if (!card) return
      const cardCenter = card.offsetLeft + card.offsetWidth / 2
      const distance = Math.abs(center - cardCenter)
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = index
      }
    })

    setActiveIndex(closestIndex)
  }, [])

  useEffect(() => {
    handleScroll()
    window.addEventListener('resize', handleScroll)
    return () => window.removeEventListener('resize', handleScroll)
  }, [handleScroll])

  // Fade + slide each card in the first time it enters the rail's viewport.
  useEffect(() => {
    const root = scrollerRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const index = Number((entry.target as HTMLElement).dataset.index)
          setVisible((prev) => {
            if (prev[index]) return prev
            const next = [...prev]
            next[index] = true
            return next
          })
          observer.unobserve(entry.target)
        })
      },
      { root, rootMargin: '0px 40px', threshold: 0.15 },
    )

    cardRefs.current.forEach((card) => card && observer.observe(card))
    return () => observer.disconnect()
  }, [products])

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  const scrollToIndex = (index: number) => {
    const el = scrollerRef.current
    const card = cardRefs.current[index]
    if (!el || !card) return

    // Centers the card in the viewport
    const targetLeft = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2
    el.scrollTo({ left: targetLeft, behavior: 'smooth' })
  }

  return (
    <div className="group/rail relative">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-[11vw] py-4 sm:-mx-6 sm:px-8 lg:-mx-8 lg:px-10"
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            ref={(el) => {
              cardRefs.current[index] = el
            }}
            data-index={index}
            className={cn(
              'w-[80vw] shrink-0 snap-center transition-all duration-500 ease-out sm:w-[42vw] sm:snap-start md:w-[30vw] lg:w-[255px]',
              visible[index] ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
            )}
          >
            <ProductCard product={product} className="h-full" />
          </div>
        ))}
      </div>

      {/* Mobile Dots Indicator */}
      {products.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-3 sm:hidden">
          {products.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to product ${index + 1}`}
              onClick={() => scrollToIndex(index)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300 ease-out',
                index === activeIndex
                  ? 'w-5 bg-navy-900'
                  : 'w-1.5 bg-navy-900/20 hover:bg-navy-900/40',
              )}
            />
          ))}
        </div>
      )}

      {(['left', 'right'] as const).map((side) => {
        const enabled = canScroll[side]
        return (
          <button
            key={side}
            type="button"
            aria-label={side === 'left' ? 'Scroll back' : 'Scroll forward'}
            onClick={() => scrollBy(side === 'left' ? -1 : 1)}
            className={cn(
              'absolute top-1/2 z-20 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-navy-900 shadow-lift transition-all hover:bg-navy-900 hover:text-white lg:flex',
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
