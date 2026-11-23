'use client'

import React from 'react'
import { Link } from '@/i18n/navigation'
import { useSelectedVariant } from '@/components/product/product-purchase'

/**
 * "Ask for a quote": opens the contact page's inquiry form with this product — and the
 * variant picked in `ProductPurchase`, when rendered inside it — already attached.
 */
export function QuoteLink({
  productSlug,
  className,
  children,
}: {
  productSlug: string
  className?: string
  children: React.ReactNode
}) {
  const variant = useSelectedVariant()

  return (
    <Link
      href={{
        pathname: '/contact',
        query: { product: productSlug, ...(variant?.id && { variant: variant.id }) },
      }}
      className={className}
    >
      {children}
    </Link>
  )
}
