import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { ProductBadge } from '@/lib/mock-data'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase',
  {
    variants: {
      variant: {
        brand: 'bg-brand-600 text-white',
        navy: 'bg-navy-900 text-white',
        sale: 'bg-rose-600 text-white',
        success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
        warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/25',
        muted: 'bg-slate-100 text-slate-600 ring-1 ring-slate-900/10',
        'on-dark': 'bg-white/10 text-white ring-1 ring-white/20',
      },
    },
    defaultVariants: {
      variant: 'brand',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

const productBadgeConfig: Record<ProductBadge, { label: string; variant: BadgeProps['variant'] }> = {
  new: { label: 'New', variant: 'brand' },
  sale: { label: 'Sale', variant: 'sale' },
  bestseller: { label: 'Bestseller', variant: 'navy' },
}

export function ProductBadgeTag({ badge, className }: { badge: ProductBadge; className?: string }) {
  const config = productBadgeConfig[badge]
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}

export function StockBadge({ inStock, className }: { inStock: boolean; className?: string }) {
  return (
    <Badge variant={inStock ? 'success' : 'warning'} className={cn('normal-case tracking-normal', className)}>
      <span
        className={cn('size-1.5 rounded-full', inStock ? 'bg-emerald-500' : 'bg-amber-500')}
        aria-hidden
      />
      {inStock ? 'In stock' : 'On order'}
    </Badge>
  )
}
