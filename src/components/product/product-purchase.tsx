'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { StockBadge } from '@/components/product/product-badge'
import { Price } from '@/components/ui/price'
import { hasDisplayPrice } from '@/lib/currency'
import { cn } from '@/lib/utils'
import { variantStockStatus, type ProductVariant } from '@/lib/variants'
import type { Product } from '@/payload-types'

/** The variant picked in `ProductPurchase`, for client components rendered inside it. */
const SelectedVariantContext = createContext<ProductVariant | undefined>(undefined)

/** The currently selected variant, or `undefined` for a product without variants. */
export const useSelectedVariant = () => useContext(SelectedVariantContext)

interface ProductPurchaseProps {
  prices: Product['prices']
  stockStatus: Product['stockStatus']
  sku?: Product['sku']
  variants?: Product['variants']
  /** The rest of the purchase card (buttons, assurances) — server-rendered, independent of the variant. */
  children?: React.ReactNode
  /**
   * The main call to action again, for the bar pinned to the bottom of small screens
   * while the purchase card is scrolled out of view.
   */
  stickyAction?: React.ReactNode
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
  stickyAction,
}: ProductPurchaseProps) {
  const t = useTranslations('productPage')
  const locale = useLocale()
  const [selected, setSelected] = useState(0)
  const variant = variants?.[selected]
  const displaySku = variant?.sku || sku
  const cardRef = useRef<HTMLDivElement>(null)
  const cardOnScreen = useOnScreen(cardRef)

  return (
    <SelectedVariantContext.Provider value={variant}>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <StockBadge status={variantStockStatus(variant, stockStatus)} />
        {displaySku && (
          <span className="text-xs text-slate-500">{t('sku', { sku: displaySku })}</span>
        )}
      </div>

      <div ref={cardRef} className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card">
        {!!variants?.length && (
          <fieldset className="mb-5">
            <legend className="mb-2.5 text-sm font-semibold text-navy-900">{t('variant')}</legend>
            <div className="flex flex-wrap gap-2">
              {variants.map((option, index) => {
                const unavailable = variantStockStatus(option, stockStatus) === 'out_of_stock'
                return (
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
                        unavailable && 'border-dashed',
                        unavailable && selected !== index && 'text-slate-400',
                      )}
                    >
                      {option.modelName}
                      {unavailable && <span className="sr-only"> ({t('variantUnavailable')})</span>}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        )}

        <Price prices={prices} overrides={variant?.priceOverrides} size="lg" />
        {/* "incl. VAT" only makes sense next to an actual price, not "price on request". */}
        {hasDisplayPrice(prices, locale, variant?.priceOverrides) && (
          <p className="mt-1 text-xs text-slate-500">{t('vatNote')}</p>
        )}

        {children}
      </div>

      {stickyAction && (
        <div
          // Out of the tab order and the accessibility tree while it's slid away.
          inert={cardOnScreen}
          className={cn(
            'fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-300 ease-out motion-reduce:transition-none lg:hidden',
            cardOnScreen
              ? 'translate-y-full'
              : 'translate-y-0 shadow-[0_-8px_24px_-12px_rgb(14_23_50/0.18)]',
          )}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="min-w-0">
              {variant && (
                <p className="truncate text-xs font-medium text-slate-500">{variant.modelName}</p>
              )}
              <Price prices={prices} overrides={variant?.priceOverrides} />
            </div>
            <div className="shrink-0">{stickyAction}</div>
          </div>
        </div>
      )}
    </SelectedVariantContext.Provider>
  )
}

/**
 * Whether `ref`'s element — or the page footer — is in the viewport. Starts `true` so the
 * sticky bar stays hidden during SSR and until the first measurement. The footer counts so
 * the bar gets out of the way of the contact details at the end of the page.
 */
function useOnScreen(ref: React.RefObject<HTMLElement | null>): boolean {
  const [onScreen, setOnScreen] = useState(true)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const visible = new Set<Element>()
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target)
        else visible.delete(entry.target)
      }
      setOnScreen(visible.size > 0)
    })
    observer.observe(element)
    const footer = document.querySelector('footer')
    if (footer) observer.observe(footer)
    return () => observer.disconnect()
  }, [ref])

  return onScreen
}
