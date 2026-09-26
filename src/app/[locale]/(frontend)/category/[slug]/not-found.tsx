import React from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import { NotFoundView } from '@/components/layout/not-found-view'
import { getBestsellers } from '@/lib/data/products'
import type { Locale } from '@/i18n/routing'

export default async function CategoryNotFound() {
  const locale = (await getLocale()) as Locale
  const [suggestions, t] = await Promise.all([
    getBestsellers(locale),
    getTranslations('notFound.category'),
  ])

  return (
    <NotFoundView title={t('title')} description={t('description')} suggestions={suggestions} />
  )
}
