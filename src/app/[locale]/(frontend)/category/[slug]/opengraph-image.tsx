import { ImageResponse } from 'next/og'
import { getTranslations } from 'next-intl/server'
import { getCategoryBySlug } from '@/lib/data/categories'
import type { Locale } from '@/i18n/routing'
import { BrandOgImage, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } from '@/lib/seo/og-image'

export const size = OG_IMAGE_SIZE
export const contentType = OG_IMAGE_CONTENT_TYPE
export const alt = 'UT Slovakia category'

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const category = await getCategoryBySlug(slug, locale)
  const t = await getTranslations({ locale, namespace: 'nav' })
  const tOg = await getTranslations({ locale, namespace: 'og' })

  return new ImageResponse(
    <BrandOgImage
      tagline={tOg('tagline')}
      eyebrow={t('category')}
      title={category?.name ?? 'UT Slovakia'}
    />,
    size,
  )
}
