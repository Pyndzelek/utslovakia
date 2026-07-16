import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Check, Headset, RefreshCcw, ShieldCheck, ShoppingCart, Truck } from 'lucide-react'
import { routing, type Locale } from '@/i18n/routing'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/ui/container'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { StockBadge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Price } from '@/components/ui/price'
import { SectionHeading } from '@/components/ui/section-heading'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductRail } from '@/components/product/product-rail'
import { getCategory, getProduct, getRelatedProducts, products } from '@/lib/mock-data'

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    products.map((product) => ({ locale, slug: product.slug })),
  )
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.excerpt,
  }
}

const assuranceKeys = ['shipping', 'warranty', 'returns'] as const
const assuranceIcons = {
  shipping: Truck,
  warranty: ShieldCheck,
  returns: RefreshCcw,
} as const

export default async function ProductPage({ params }: PageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const product = getProduct(slug)
  if (!product) notFound()

  const t = await getTranslations('productPage')
  const category = getCategory(product.categorySlug)
  const related = getRelatedProducts(product)

  return (
    <>
      <div className="border-b border-line bg-white">
        <Container className="py-5">
          <Breadcrumbs
            items={[
              { label: t('breadcrumbProducts'), href: '/products' },
              ...(category
                ? [
                    {
                      label: category.name,
                      href: {
                        pathname: '/category/[slug]',
                        params: { slug: category.slug },
                      } as const,
                    },
                  ]
                : []),
              { label: product.name },
            ]}
          />
        </Container>
      </div>

      {/* Product overview */}
      <Container className="py-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery image={product.image} name={product.name} badge={product.badge} />

          <div>
            <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-balance text-navy-900 sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <StockBadge inStock={product.inStock} />
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card">
              <Price
                price={product.price}
                oldPrice={product.oldPrice}
                lowestPriceNote={product.lowestPriceNote}
                size="lg"
              />
              <p className="mt-1 text-xs text-slate-400">{t('vatNote')}</p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1 basis-48"
                  disabled={!product.inStock}
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
              {product.description.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-display mt-8 text-lg font-semibold text-navy-900">
              {t('keyFeatures')}
            </h3>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* Related products */}
      {related.length > 0 && (
        <section className="border-t border-line bg-white py-16">
          <Container>
            <SectionHeading
              eyebrow={category?.name}
              title={t('relatedTitle')}
              action={
                category ? (
                  <Link
                    href={{ pathname: '/category/[slug]', params: { slug: category.slug } }}
                    className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                  >
                    {t('viewCategory')}
                  </Link>
                ) : undefined
              }
              className="mb-8"
            />
            <ProductRail products={related} />
          </Container>
        </section>
      )}
    </>
  )
}
