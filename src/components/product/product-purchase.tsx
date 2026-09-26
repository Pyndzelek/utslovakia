'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { StockBadge } from '@/components/product/product-badge'
import { Price } from '@/components/ui/price'
import { cn } from '@/lib/utils'
import { variantStockStatus } from '@/lib/variants'
import type { Product } from '@/payload-types'

interface ProductPurchaseProps {
  prices: Product['prices']
  stockStatus: Product['stockStatus']
  sku?: Product['sku']
  variants?: Product['variants']
  /** The rest of the purchase card (buttons, assurances) — server-rendered, independent of the variant. */
  children?: React.ReactNode
}

/**
 * The variant-dependent part of the product page: stock badge, SKU, variant
 * picker and price. The first variant is preselected; each one falls back to
 * the product's own stock status and prices wherever it doesn't override them.
 */
export function ProductPurchase({
  prices,
  stockStatus,
  sku,
  variants,
  children,
}: ProductPurchaseProps) {
  const t = useTranslations('productPage')
  const [selected, setSelected] = useState(0)
  const variant = variants?.[selected]
  const displaySku = variant?.sku || sku

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <StockBadge status={variantStockStatus(variant, stockStatus)} />
        {displaySku && (
          <span className="text-xs text-slate-500">{t('sku', { sku: displaySku })}</span>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card">
        {!!variants?.length && (
          <fieldset className="mb-5">
            <legend className="mb-2.5 text-sm font-semibold text-navy-900">{t('variant')}</legend>
            <div className="flex flex-wrap gap-2">
              {variants.map((option, index) => (
                <label key={option.id ?? index} className="cursor-pointer">
                  <input
                    type="radio"
                    name="product-variant"
                    value={index}
                    checked={selected === index}
                    onChange={() => setSelected(index)}
                    className="peer sr-only"
                  />
                  {/* Selected style comes from state, not `:has(:checked)` — Chrome doesn't
                      restyle `:has()` matches when React flips a radio's `checked`. */}
                  <span
                    className={cn(
                      'block rounded-full border px-4 py-2 text-sm font-medium transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500',
                      selected === index
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-line text-navy-900 hover:border-brand-400',
                      selected !== index &&
                        variantStockStatus(option, stockStatus) === 'out_of_stock' &&
                        'text-slate-400',
                    )}
                  >
                    {option.modelName}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <Price prices={prices} overrides={variant?.priceOverrides} size="lg" />
        <p className="mt-1 text-xs text-slate-500">{t('vatNote')}</p>

        {children}
      </div>
    </>
  )
}
