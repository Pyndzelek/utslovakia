import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { Link, getPathname } from '@/i18n/navigation'
import { Container } from '@/components/ui/container'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { buttonVariants } from '@/components/ui/button'
import { SectionHeading } from '@/components/ui/section-heading'
import { ProductRail } from '@/components/product/product-rail'
import ProductView from '@/components/product/product-view'
import { Product } from '@/payload-types'
import { useTranslations } from 'next-intl'
import {
  getAllProductSlugs,
  getProductBySlug,
  getProductSlugsByLocale,
  getProductsByCategory,
} from '@/lib/data/products'
import { buildDynamicLanguageAlternates } from '@/lib/seo/alternates'
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo/json-ld'
import { getMediaUrl } from '@/lib/utils'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>
}

export async function generateStaticParams() {
  const paramsByLocale = await Promise.all(
    routing.locales.map(async (locale) => {
      const slugs = await getAllProductSlugs(locale)
      return slugs.map((slug) => ({ locale, slug }))
    }),
  )

  return paramsByLocale.flat()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await getProductBySlug(slug, locale)
  if (!product) return {}

  const brand = typeof product.brand === 'object' ? product.brand : null
  const firstCategory = typeof product.categories?.[0] === 'object' ? product.categories[0] : null

  const title =
    product.meta?.title ??
    [product.title, brand?.name, firstCategory?.name, 'UTSlovakia'].filter(Boolean).join(' | ')
  const description = product.meta?.description ?? product.description

  const canonicalPath = getPathname({ locale, href: { pathname: '/products/[slug]', params: { slug } } })
  const languages = await buildLanguageAlternates(product.id)

  const image = typeof product.images?.[0]?.image === 'object' ? product.images[0].image : null
  const imageUrl = getMediaUrl(image)

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages,
    },
    openGraph: {
      type: 'website',
      url: canonicalPath,
      title,
      description,
      images: imageUrl ? [{ url: imageUrl, alt: product.images?.[0]?.alt ?? product.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const payloadProduct = await getProductBySlug(slug, locale)
  if (!payloadProduct) {
    notFound()
  }

  const canonicalPath = getPathname({
    locale,
    href: { pathname: '/products/[slug]', params: { slug } },
  })
  const image =
    typeof payloadProduct.images?.[0]?.image === 'object' ? payloadProduct.images[0].image : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', path: getPathname({ locale, href: '/' }) },
              { name: 'Products', path: getPathname({ locale, href: '/products' }) },
              { name: payloadProduct.title, path: canonicalPath },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            productJsonLd({
              product: payloadProduct,
              locale,
              canonicalPath,
              imageUrl: getMediaUrl(image),
            }),
          ),
        }}
      />

      <BreadcrumbsHeader
        productTitle={payloadProduct.title}
        categories={payloadProduct.categories}
      />

      <ProductView product={payloadProduct} />

      <RelatedProducts
        categories={payloadProduct.categories}
        currentProductId={payloadProduct.id}
        locale={locale}
      />
    </>
  )
}

/** Builds `alternates.languages` from this product's per-locale slugs. */
async function buildLanguageAlternates(productId: number) {
  const slugsByLocale = await getProductSlugsByLocale(productId)
  return buildDynamicLanguageAlternates('/products/[slug]', slugsByLocale)
}

// 3. Inject actual category data into Breadcrumbs
function BreadcrumbsHeader({
  productTitle,
  categories,
}: {
  productTitle: string
  categories: Product['categories']
}) {
  const t = useTranslations('productPage')

  // Safely extract the first category from the array
  const firstCategory = categories?.[0]
  const categoryData =
    typeof firstCategory === 'object' && firstCategory !== null ? firstCategory : null

  return (
    <div className="border-b border-line bg-white">
      <Container className="py-5">
        <Breadcrumbs
          items={[
            { label: t('breadcrumbProducts'), href: '/products' },
            categoryData && {
              label: categoryData.name,
              href: {
                pathname: '/category/[slug]',
                params: { slug: categoryData.slug },
              },
            },
            { label: productTitle },
          ]}
        />
      </Container>
    </div>
  )
}

// 4. Query Payload for Related Products
async function RelatedProducts({
  categories,
  currentProductId,
  locale,
}: {
  categories: Product['categories']
  currentProductId: string | number
  locale: Locale
}) {
  const t = await getTranslations('productPage') // Use await inside async Server Components

  const firstCategory = categories?.[0]
  const categoryData =
    typeof firstCategory === 'object' && firstCategory !== null ? firstCategory : null

  if (!categoryData) return null

  //:TODO: Add logic to exclude the current product from the related products
  const relatedProducts = await getProductsByCategory(categoryData.id, locale)

  return (
    <section className="border-t border-line bg-white py-16">
      <Container>
        <SectionHeading
          eyebrow={categoryData.name}
          title={t('relatedTitle')}
          action={
            <Link
              href={{ pathname: '/category/[slug]', params: { slug: categoryData.slug } }}
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              {t('viewCategory')}
            </Link>
          }
          className="mb-8"
        />
        <ProductRail products={relatedProducts} />
      </Container>
    </section>
  )
}
