import { ImageResponse } from 'next/og'
import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { BrandOgImage, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } from '@/lib/seo/og-image'

export const size = OG_IMAGE_SIZE
export const contentType = OG_IMAGE_CONTENT_TYPE
export const alt = 'UT Slovakia'

export default async function OpengraphImage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  const tOg = await getTranslations({ locale, namespace: 'og' })

  return new ImageResponse(
    <BrandOgImage tagline={tOg('tagline')} eyebrow="UT Slovakia" title={t('title')} />,
    size,
  )
}
