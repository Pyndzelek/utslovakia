import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export function InStock({ inStock }: { inStock: boolean }) {
  const t = useTranslations('product.stock')
  return (
    <p className={cn('mt-1.5 text-xs', inStock ? 'text-emerald-600' : 'text-amber-600')}>
      {inStock ? t('inStock') : t('onOrder')}
    </p>
  )
}
