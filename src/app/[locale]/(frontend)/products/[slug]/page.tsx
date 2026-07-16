import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import {
  Check,
  FileDown,
  Headset,
  Heart,
  RefreshCcw,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import { routing, type Locale } from '@/i18n/routing'
import { Container } from '@/components/ui/container'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { StockBadge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Price } from '@/components/ui/price'
import { SectionHeading } from '@/components/ui/section-heading'
import { ProductGallery } from '@/components/product/product-gallery'
import { QuantityPicker } from '@/components/product/quantity-picker'
import { SpecTable } from '@/components/product/spec-table'
import { ProductRail } from '@/components/product/product-rail'
import { getCategory, getProduct, getRelatedProducts, products } from '@/lib/mock-data'
import { Link } from '@/i18n/navigation'

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

const assurances = [
  { Icon: Truck, title: 'Wysyłka międzynarodowa', text: 'FedEx international shipping' },
  { Icon: ShieldCheck, title: 'Gwarancja 3 miesiące', text: 'Sprawdzony produkt' },
  { Icon: RefreshCcw, title: '30 dni na zwrot', text: 'Niezadowolony? Zwróć w ciągu 30 dni' },
]

const downloads = [
  'Product datasheet (PDF, 1.2 MB)',
  'Installation manual (PDF, 3.8 MB)',
  'Firmware release notes (PDF, 0.4 MB)',
]

export default async function ProductPage({ params }: PageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const product = getProduct(slug)
  if (!product) notFound()

  const category = getCategory(product.categorySlug)
  const related = getRelatedProducts(product)

  return (
    <>
      <div className="border-b border-line bg-white">
        <Container className="py-5">
          <Breadcrumbs
            items={[
              { label: 'Products', href: '/products' },
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
            {/* <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold tracking-[0.14em] text-brand-600 uppercase">
                {product.brand}
              </p>
              <span className="text-xs text-slate-300">|</span>
              <p className="text-xs text-slate-400">SKU: {product.sku}</p>
            </div> */}

            <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-balance text-navy-900 sm:text-4xl">
              {product.name}
            </h1>

            {/* <p className="mt-4 text-[15px] leading-relaxed text-slate-500">{product.excerpt}</p> */}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <StockBadge inStock={product.inStock} />
              {/* <span className="text-sm text-slate-500">{product.leadTime}</span> */}
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-white p-6 shadow-card">
              <Price
                price={product.price}
                oldPrice={product.oldPrice}
                lowestPriceNote={product.lowestPriceNote}
                size="lg"
              />
              <p className="mt-1 text-xs text-slate-400">w tym VAT · dostępne rabaty ilościowe</p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {/* <QuantityPicker /> */}
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1 basis-48"
                  disabled={!product.inStock}
                >
                  <ShoppingCart aria-hidden />
                  Kup poprzez Ebay
                </Button>
                {/* <Button variant="outline" size="icon" aria-label="Add to wishlist">
                  <Heart aria-hidden />
                </Button> */}
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-500">
                Potrzebujesz większych ilości lub innej wersji? Skontaktuj się z nami bezpośrednio.
              </p>

              <div className="mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-3">
                {assurances.map(({ Icon, title, text }) => (
                  <div key={title} className="flex gap-2.5 sm:flex-col sm:gap-2">
                    <Icon className="size-5 shrink-0 text-brand-600" aria-hidden />
                    <div>
                      <p className="text-xs font-semibold text-navy-900">{title}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-brand-50 p-4">
              <Headset
                className="size-8 shrink-0 rounded-full bg-white p-1.5 text-brand-600"
                aria-hidden
              />
              <p className="text-sm text-slate-600">
                Nie jesteś pewny, czy pasuje do Twojego sprzętu?{' '}
                <Link
                  href="/contact"
                  className="font-semibold text-brand-700 underline-offset-2 hover:underline"
                >
                  Skontaktuj się z nami
                </Link>{' '}
                odpowiemy najszybciej jak to możliwe.
              </p>
            </div>
          </div>
        </div>

        {/* Description + specs */}
        <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-14">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-navy-900">
              Opis
            </h2>
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-slate-600">
              {product.description.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-display mt-8 text-lg font-semibold text-navy-900">
              Kluczowe cechy
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

          {/* <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-navy-900">
              Specifications
            </h2>
            <div className="mt-4">
              <SpecTable specs={product.specs} />
            </div>
          </div> */}
        </div>
      </Container>

      {/* Related products */}
      {related.length > 0 && (
        <section className="border-t border-line bg-white py-16">
          <Container>
            <SectionHeading
              eyebrow={category?.name}
              title="Możesz potrzebować również"
              action={
                category ? (
                  <Link
                    href={{ pathname: '/category/[slug]', params: { slug: category.slug } }}
                    className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                  >
                    Zobacz kategorię
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
