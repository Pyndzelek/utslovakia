import { ImageResponse } from 'next/og'
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

  return new ImageResponse(
    <BrandOgImage eyebrow="Categories" title={category?.name ?? 'UT Slovakia'} />,
    size,
  )
}
