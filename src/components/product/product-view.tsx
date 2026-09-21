import React from 'react'
import { Container } from '../ui/container'
import { ProductGallery } from './product-gallery'
import { StockBadge } from './product-badge'
import { Price } from '../ui/price'
import { Button } from '../ui/button'
import { Check, Headset, RefreshCcw, ShieldCheck, ShoppingCart, Truck } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Product } from '@/payload-types'
import { useTranslations } from 'next-intl'

const assuranceKeys = ['shipping', 'warranty', 'returns'] as const
const assuranceIcons = {
  shipping: Truck,
  warranty: ShieldCheck,
  returns: RefreshCcw,
} as const

export default function ProductView({ product }: { product: Product }) {
  const t = useTranslations('productPage')
  return (
    <Container className="py-8 lg:py-12">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} title={product.title} badge={product.badge} />

        <div>
          <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-balance text-navy-900 sm:text-4xl">
            {product.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <StockBadge status={product.stockStatus} />
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card">
            <Price price={product.prices.EUR ?? product.prices.PLN} size="lg" />
            <p className="mt-1 text-xs text-slate-400">{t('vatNote')}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                className="flex-1 basis-48"
                disabled={!!product.link}
              >
                <ShoppingCart aria-hidden />
                {t('buyViaEbay')}
              </Button>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-500">{t('bulkInquiry')}</p>

            <div className="mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-3">
              {assuranceKeys.map((key) => {
                const Icon = assuranceIcons[key]
                return (
                  <div key={key} className="flex gap-2.5 sm:flex-col sm:gap-2">
                    <Icon className="size-5 shrink-0 text-brand-600" aria-hidden />
                    <div>
                      <p className="text-xs font-semibold text-navy-900">
                        {t(`assurances.${key}.title`)}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-400">
                        {t(`assurances.${key}.text`)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-50 p-4">
            <Headset
              className="size-8 shrink-0 rounded-full bg-white p-1.5 text-brand-600"
              aria-hidden
            />
            <p className="text-sm text-slate-600">
              {t.rich('compatibilityHelp', {
                link: (chunks) => (
                  <Link
                    href="/contact"
                    className="font-semibold text-brand-700 underline-offset-2 hover:underline"
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Description + specs */}
      <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-14">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-navy-900">
            {t('description')}
          </h2>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-slate-600">
            {product.description}
          </div>
        </div>
        <div>
          <h3 className="font-display mt-8 text-lg font-semibold text-navy-900">
            {t('keyFeatures')}
          </h3>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {product.keyFeatures?.map((feature) => (
              <li key={feature.text} className="flex items-start gap-2.5 text-sm text-slate-600">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                {feature.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  )
}
