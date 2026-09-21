import React from 'react'
import { getLocale } from 'next-intl/server'
import { NotFoundView } from '@/components/layout/not-found-view'
import { getBestsellers } from '@/lib/data/products'
import type { Locale } from '@/i18n/routing'

export default async function FrontendNotFound() {
  const locale = (await getLocale()) as Locale
  const suggestions = await getBestsellers(locale)

  return (
    <NotFoundView
      title="We couldn't find that page"
      description="The address may be mistyped, or the page has moved. Use the navigation above, or start from one of the links below."
      suggestions={suggestions}
    />
  )
}
