import React from 'react'
import { useTranslations } from 'next-intl'
import { Check, Headset, RefreshCcw, ShieldCheck, ShoppingCart, Truck } from 'lucide-react'
import { Container } from '../ui/container'
import { ProductGallery } from './product-gallery'
import { ProductPurchase } from './product-purchase'
import { QuoteLink } from './quote-link'
import { buttonVariants } from '../ui/button'
import { ProductDescription } from './product-description'
import { cn } from '@/lib/utils'
import { Link } from '@/i18n/navigation'
import { Product } from '@/payload-types'

const assuranceIcons = {
  shipping: Truck,
  warranty: ShieldCheck,
  returns: RefreshCcw,
} as const

export default function ProductView({ product }: { product: Product }) {
  const t = useTranslations('productPage')
  // No warranty set (or 0) → the tile is left out rather than promising a default.
  const warrantyMonths = product.warranty ?? 0
  const assuranceKeys = (['shipping', 'warranty', 'returns'] as const).filter(
    (key) => key !== 'warranty' || warrantyMonths > 0,
  )
  const brand = typeof product.brand === 'object' ? product.brand : null
  const category = typeof product.categories?.[0] === 'object' ? product.categories[0] : null
  const keyFeatures = product.keyFeatures ?? []

  // Without an eBay listing the product is sold by inquiry, so the quote form is the main action.
  const buyLink = product.link ? (
    <a
      href={product.link}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({ variant: 'primary', size: 'md' })}
    >
      <ShoppingCart aria-hidden />
      {t('buyViaEbay')}
    </a>
  ) : null

  return (
    <Container className="py-8 lg:py-12">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} title={product.title} badge={product.badge} />

        <div>
          {brand && (
            <p className="text-xs font-semibold tracking-[0.14em] uppercase">
              <Link
                href={{ pathname: '/products', query: { brand: brand.id } }}
                className="rounded-sm text-brand-700 transition-colors hover:text-brand-800"
              >
                {brand.name}
              </Link>
            </p>
          )}
          <h1
            className={cn(
              'font-display text-3xl font-semibold tracking-tight text-balance text-navy-900 sm:text-4xl',
              brand && 'mt-2',
            )}
          >
            {product.title}
          </h1>

          <ProductPurchase
            prices={product.prices}
            stockStatus={product.stockStatus}
            sku={product.sku}
            variants={product.variants}
            stickyAction={
              buyLink ?? (
                <QuoteLink
                  productSlug={product.slug}
                  className={buttonVariants({ variant: 'primary', size: 'md' })}
                >
                  <Headset aria-hidden />
                  {t('askForOffer')}
                </QuoteLink>
              )
            }
          >
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {product.link && (
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: 'primary', size: 'lg' }),
                    'flex-1 basis-48',
                  )}
                >
                  <ShoppingCart aria-hidden />
                  {t('buyViaEbay')}
                </a>
              )}
              <QuoteLink
                productSlug={product.slug}
                className={cn(
                  buttonVariants({ variant: product.link ? 'outline' : 'primary', size: 'lg' }),
                  'flex-1 basis-48',
                )}
              >
                <Headset aria-hidden />
                {t('askForOffer')}
              </QuoteLink>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-500">{t('bulkInquiry')}</p>

            <div
              className={cn(
                'mt-5 grid gap-3 border-t border-line pt-5',
                assuranceKeys.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2',
              )}
            >
              {assuranceKeys.map((key) => {
                const Icon = assuranceIcons[key]
                return (
                  <div key={key} className="flex gap-2.5 sm:flex-col sm:gap-2">
                    <Icon className="size-5 shrink-0 text-brand-600" aria-hidden />
                    <div>
                      <p className="text-xs font-semibold text-navy-900">
                        {t(`assurances.${key}.title`, { months: warrantyMonths })}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
                        {t(`assurances.${key}.text`)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </ProductPurchase>

          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-50 p-4">
            <Headset
              className="size-8 shrink-0 rounded-full bg-white p-1.5 text-brand-600"
              aria-hidden
            />
            <p className="text-sm text-slate-600">
              {t.rich('compatibilityHelp', {
                link: (chunks) => (
                  <QuoteLink
                    productSlug={product.slug}
                    className="rounded-sm font-semibold text-brand-700 underline-offset-2 hover:underline"
                  >
                    {chunks}
                  </QuoteLink>
                ),
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Facts card + description. The card comes first in the DOM (and on small screens);
          from `lg` it sits to the right of the description and follows the scroll. */}
      <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
        <aside className="lg:sticky lg:top-28 lg:col-start-2 lg:row-start-1 lg:self-start">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
            <h2 className="font-display text-lg font-semibold text-navy-900">{t('details')}</h2>
            <dl className="mt-3 divide-y divide-line text-sm">
              {product.sku && <DetailRow label={t('detailSku')}>{product.sku}</DetailRow>}
              {brand && (
                <DetailRow label={t('detailBrand')}>
                  <Link
                    href={{ pathname: '/products', query: { brand: brand.id } }}
                    className="rounded-sm text-brand-700 underline-offset-2 hover:underline"
                  >
                    {brand.name}
                  </Link>
                </DetailRow>
              )}
              {category && (
                <DetailRow label={t('detailCategory')}>
                  <Link
                    href={{ pathname: '/category/[slug]', params: { slug: category.slug } }}
                    className="rounded-sm text-brand-700 underline-offset-2 hover:underline"
                  >
                    {category.name}
                  </Link>
                </DetailRow>
              )}
              {warrantyMonths > 0 && (
                <DetailRow label={t('detailWarranty')}>
                  {t('warrantyMonths', { months: warrantyMonths })}
                </DetailRow>
              )}
            </dl>

            {keyFeatures.length > 0 && (
              <>
                <h3 className="font-display mt-6 text-base font-semibold text-navy-900">
                  {t('keyFeatures')}
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {keyFeatures.map((feature, index) => (
                    <li
                      key={feature.id ?? index}
                      className="flex items-start gap-2.5 text-sm text-slate-600"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                      {feature.text}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </aside>

        <section className="lg:col-start-1 lg:row-start-1">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-navy-900">
            {t('description')}
          </h2>
          <ProductDescription text={product.description} />
        </section>
      </div>
    </Container>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-2.5">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-navy-900">{children}</dd>
    </div>
  )
}
