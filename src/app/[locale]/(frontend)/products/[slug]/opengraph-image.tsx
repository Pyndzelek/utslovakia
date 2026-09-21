import { ImageResponse } from 'next/og'
import { getProductBySlug } from '@/lib/data/products'
import { formatPrice } from '@/lib/format'
import type { Locale } from '@/i18n/routing'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'UT Slovakia product'

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  const product = await getProductBySlug(slug, locale)

  const brandDoc = typeof product?.brand === 'object' ? product.brand : null

  const name = product?.title ?? 'UT Slovakia'
  const brand = brandDoc?.name ?? 'Payment systems & components'
  // formatPrice renders EUR (sk-SK locale); prefer the EUR price when set, PLN otherwise
  const displayPrice = product?.prices?.EUR ?? product?.prices?.PLN
  const price = displayPrice ? formatPrice(displayPrice) : null

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          backgroundColor: '#080e21',
          backgroundImage: 'radial-gradient(circle at 85% 20%, rgba(63,112,242,0.35), transparent 55%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: '#2953e6',
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            UT
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 26, fontWeight: 700 }}>UT Slovakia</span>
            <span style={{ fontSize: 16, color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase' }}>
              Payment systems
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <span style={{ fontSize: 22, color: '#98bdfc', letterSpacing: 3, textTransform: 'uppercase' }}>
            {brand}
          </span>
          <span style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>{name}</span>
          {price && (
            <span
              style={{
                display: 'flex',
                alignSelf: 'flex-start',
                padding: '12px 28px',
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                fontSize: 30,
                fontWeight: 600,
              }}
            >
              {price}
            </span>
          )}
        </div>
      </div>
    ),
    size,
  )
}
