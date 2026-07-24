import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/ui/container'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { buttonVariants } from '@/components/ui/button'
import { SectionHeading } from '@/components/ui/section-heading'
import { ProductRail } from '@/components/product/product-rail'
import { getCategory, getProduct, getRelatedProducts, products } from '@/lib/mock-data'
import ProductView from '@/components/product/product-view'
// import { getPayloadClient } from '@/lib/payload'
import { Category, Product } from '@/payload-types'
import { useTranslations } from 'next-intl'
import { getProductBySlug, getProductsByCategory } from '@/lib/data/products'

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>
}

//:TODO GENERATE STATIC PARAMS FROM PAYLOAD

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

export default async function ProductPage({ params }: PageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const payloadProduct = await getProductBySlug(slug, locale)
  if (!payloadProduct) {
    notFound()
  }

  return (
    <>
      <BreadcrumbsHeader productTitle={payloadProduct.title} category={payloadProduct.category} />

      <ProductView product={payloadProduct} />

      <RelatedProducts
        category={payloadProduct.category}
        currentProductId={payloadProduct.id}
        locale={locale}
      />
    </>
  )
}

// 3. Inject actual category data into Breadcrumbs
function BreadcrumbsHeader({
  productTitle,
  category,
}: {
  productTitle: string
  category: Product['category']
}) {
  const t = useTranslations('productPage')

  // Safely extract the first category from the array
  const firstCategory = category?.[0]
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
  category,
  currentProductId,
  locale,
}: {
  category: Product['category']
  currentProductId: string | number
  locale: Locale
}) {
  const t = await getTranslations('productPage') // Use await inside async Server Components

  const firstCategory = category?.[0]
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
