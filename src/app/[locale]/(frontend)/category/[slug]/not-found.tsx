import React from 'react'
import { getLocale } from 'next-intl/server'
import { NotFoundView } from '@/components/layout/not-found-view'
import { getBestsellers } from '@/lib/data/products'
import type { Locale } from '@/i18n/routing'

export default async function CategoryNotFound() {
  const locale = (await getLocale()) as Locale
  const suggestions = await getBestsellers(locale)

  return (
    <NotFoundView
      title="This category doesn't exist"
      description="The category you're looking for may have been renamed or removed. Browse the full catalog or jump back to the homepage."
      suggestions={suggestions}
    />
  )
}
