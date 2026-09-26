import React from 'react'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import { formatPrice, resolvePrice } from '@/lib/currency'
import type { Product } from '@/payload-types'

interface PriceProps {
  /** The product's multi-currency prices; the displayed currency follows the active locale. */
  prices?: Product['prices']
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

export function Price({ prices, oldPrice, lowestPriceNote, size = 'md', className }: PriceProps) {
  const locale = useLocale()
  const price = prices ? resolvePrice(prices, locale) : null

  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className={cn('font-display font-semibold text-navy-900', sizes[size].current)}>
          {price?.amount ? formatPrice(price.amount, price.currency, locale) : 'N/A'}
        </span>
        {/* {oldPrice && price && (
          <span className={cn('text-slate-400 line-through', sizes[size].old)}>
            {formatPrice(oldPrice, price.currency, locale)}
          </span>
        )} */}
      </div>
      {/* {oldPrice && lowestPriceNote && price && (
        <p className="mt-1 text-[11px] leading-snug text-slate-400">
          Lowest price in the 30 days before discount: {formatPrice(lowestPriceNote, price.currency, locale)}
        </p>
      )} */}
    </div>
  )
}
