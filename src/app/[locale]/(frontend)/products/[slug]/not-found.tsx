import React from 'react'
import { getLocale } from 'next-intl/server'
import { NotFoundView } from '@/components/layout/not-found-view'
import { getBestsellers } from '@/lib/data/products'
import type { Locale } from '@/i18n/routing'

export default async function ProductNotFound() {
  const locale = (await getLocale()) as Locale
  const suggestions = await getBestsellers(locale)

  return (
    <NotFoundView
      title="This product is no longer available"
      description="It may have been discontinued or replaced by a newer model. Our bestsellers below cover the same jobs — or ask our engineers for the direct successor."
      suggestions={suggestions}
    />
  )
}
