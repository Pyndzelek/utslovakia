import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { Product } from '@/payload-types'

export function ProductBadgeTag({
  badge,
  className,
}: {
  badge: Product['badge']
  className?: string
}) {
  const t = useTranslations('product.badge')

  if (!badge) return null

  const colors = {
    new: 'bg-brand-600 text-white',
    sale: 'bg-rose-600 text-white',
    bestseller: 'bg-navy-900 text-white',
    refurbished: 'bg-slate-100 text-slate-600 ring-1 ring-slate-900/10',
  }[badge]

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase',
        colors,
        className,
      )}
    >
      {t(badge)}
    </span>
  )
}

// Shows the product's stock status as a colored dot + label.
export function StockBadge({
  status,
  className,
}: {
  status: Product['stockStatus']
  className?: string
}) {
  const t = useTranslations('product.stock')

  // in_stock is green, everything else (out of stock / preorder) is amber
  const inStock = status === 'in_stock'

  const label =
    status === 'out_of_stock'
      ? t('outOfStock')
      : status === 'preorder'
        ? t('preorder')
        : t('inStock')

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        inStock
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
          : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/25',
        className,
      )}
    >
      <span
        className={cn('size-1.5 rounded-full', inStock ? 'bg-emerald-500' : 'bg-amber-500')}
        aria-hidden
      />
      {label}
    </span>
  )
}
