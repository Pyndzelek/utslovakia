import React from 'react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'

interface PriceProps {
  price: number
  oldPrice?: number
  /** Lowest price in the 30 days before the discount (EU Omnibus directive) */
  lowestPriceNote?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { current: 'text-base', old: 'text-xs' },
  md: { current: 'text-lg', old: 'text-sm' },
  lg: { current: 'text-3xl', old: 'text-base' },
}

export function Price({ price, oldPrice, lowestPriceNote, size = 'md', className }: PriceProps) {
  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className={cn('font-display font-semibold text-navy-900', sizes[size].current)}>
          {formatPrice(price)}
        </span>
        {/* {oldPrice && (
          <span className={cn('text-slate-400 line-through', sizes[size].old)}>
            {formatPrice(oldPrice)}
          </span>
        )} */}
      </div>
      {/* {oldPrice && lowestPriceNote && (
        <p className="mt-1 text-[11px] leading-snug text-slate-400">
          Lowest price in the 30 days before discount: {formatPrice(lowestPriceNote)}
        </p>
      )} */}
    </div>
  )
}
