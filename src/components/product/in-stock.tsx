import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { Product } from '@/payload-types'

const styles: Record<Product['stockStatus'], { text: string; dot: string }> = {
  in_stock: { text: 'text-emerald-700', dot: 'bg-emerald-500' },
  preorder: { text: 'text-amber-700', dot: 'bg-amber-500' },
  out_of_stock: { text: 'text-slate-500', dot: 'bg-slate-400' },
}

const labelKeys = {
  in_stock: 'inStock',
  preorder: 'onOrder',
  out_of_stock: 'outOfStock',
} as const satisfies Record<Product['stockStatus'], string>

/** Compact availability line for product cards: coloured dot + label. */
export function InStock({ status }: { status: Product['stockStatus'] }) {
  const t = useTranslations('product.stock')
  const style = styles[status] ?? styles.in_stock
  return (
    <p className={cn('mt-1.5 flex items-center gap-1.5 text-xs', style.text)}>
      <span className={cn('size-1.5 shrink-0 rounded-full', style.dot)} aria-hidden />
      {t(labelKeys[status] ?? 'inStock')}
    </p>
  )
}
