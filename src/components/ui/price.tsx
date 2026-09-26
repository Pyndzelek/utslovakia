import React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { formatPrice, resolvePrice } from '@/lib/currency'
import type { Product } from '@/payload-types'

interface PriceProps {
  /** The product's multi-currency prices; the displayed currency follows the active locale. */
  prices?: Product['prices']
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-3xl',
}

export function Price({ prices, size = 'md', className }: PriceProps) {
  const locale = useLocale()
  const t = useTranslations('price')
  const price = prices ? resolvePrice(prices, locale) : null
  // 0 means the editor left the price empty rather than a free product.
  const hasPrice = typeof price?.amount === 'number' && price.amount > 0

  return (
    <div className={className}>
      <span className={cn('font-display font-semibold text-navy-900', sizes[size])}>
        {hasPrice ? formatPrice(price.amount, price.currency, locale) : t('onRequest')}
      </span>
    </div>
  )
}
