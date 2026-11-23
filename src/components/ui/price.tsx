import React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { formatPrice, resolvePrice } from '@/lib/currency'
import type { Product } from '@/payload-types'
import type { ProductVariant } from '@/lib/variants'

interface PriceProps {
  /** The product's multi-currency prices; the displayed currency follows the active locale. */
  prices?: Product['prices']
  /** The selected variant's price overrides, applied on top of `prices`. */
  overrides?: ProductVariant['priceOverrides']
  /**
   * Amount to show instead of the one resolved from `prices`/`overrides`, in the same
   * currency — e.g. the cheapest variant on a product card (see `priceRange`).
   */
  amount?: number
  /** Prefix the amount with "from": the product's variants start at this price. */
  from?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-3xl',
}

export function Price({ prices, overrides, amount, from, size = 'md', className }: PriceProps) {
  const locale = useLocale()
  const t = useTranslations('price')
  const price = prices ? resolvePrice(prices, locale, overrides) : null
  const shown = amount ?? price?.amount
  // 0 means the editor left the price empty rather than a free product.
  const hasPrice = price !== null && typeof shown === 'number' && shown > 0

  return (
    <div className={className}>
      {hasPrice && from && (
        <span className="mr-1 text-xs font-medium text-slate-500">{t('from')}</span>
      )}
      <span className={cn('font-display font-semibold text-navy-900', sizes[size])}>
        {hasPrice ? formatPrice(shown, price.currency, locale) : t('onRequest')}
      </span>
    </div>
  )
}
