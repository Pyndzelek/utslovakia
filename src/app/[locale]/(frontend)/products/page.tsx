import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { getPathname } from '@/i18n/navigation'
import { Container } from '@/components/ui/container'
import { FilterSidebar } from '@/components/catalog/filter-sidebar'
import { CatalogToolbar } from '@/components/catalog/catalog-toolbar'
import { MobileFilters } from '@/components/catalog/mobile-filters'
import { Pagination } from '@/components/catalog/pagination'
import { CatalogEmptyState } from '@/components/catalog/empty-state'
import { ProductGrid } from '@/components/product/product-grid'
import PageHeader from '@/components/layout/page-header'
import { getFilteredProducts, getProductCountsByCategory } from '@/lib/data/products'
import { getCategories } from '@/lib/data/categories'
import { buildStaticLanguageAlternates } from '@/lib/seo/alternates'
import { itemListJsonLd } from '@/lib/seo/json-ld'

export const revalidate = 300

interface PageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{
    page?: string
    minPrice?: string
    maxPrice?: string
    category?: string
    sort?: string
    q?: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'products.meta' })
  const canonicalPath = getPathname({ locale, href: '/products' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: canonicalPath,
      languages: buildStaticLanguageAlternates('/products'),
    },
  }
}

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('products')

  // Parse URL string parameters cleanly into numbers
  const query = await searchParams
  const page = query.page ? parseInt(query.page, 10) : 1
  const minPrice = query.minPrice ? parseFloat(query.minPrice) : undefined
  const maxPrice = query.maxPrice ? parseFloat(query.maxPrice) : undefined

  // Supports comma-separated category IDs in the URL (e.g., "?category=1,4")
  const categoryIds = query.category
    ? query.category
        .split(',')
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => !isNaN(id))
    : undefined

  // Fetch paginated & filtered data
  const [{ docs: products, totalPages, totalDocs }, categories, productCounts] = await Promise.all([
    getFilteredProducts(locale, {
      page,
      limit: 12,
      minPrice,
      maxPrice,
      categoryIds,
      sort: query.sort || '-createdAt',
      search: query.q,
    }),
    getCategories(locale, 0),
    getProductCountsByCategory(locale),
  ])

  const basePath = getPathname({ locale, href: '/products' })
  const hasFilters = Boolean(
    query.q || query.category || query.minPrice || query.maxPrice || page > 1,
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            itemListJsonLd({
              items: products.map((product) => ({
                name: product.title,
                path: getPathname({
                  locale,
                  href: { pathname: '/products/[slug]', params: { slug: product.slug } },
                }),
              })),
            }),
          ),
        }}
      />

      <PageHeader
        title={t('title')}
        description={t('description')}
        breadcrumbs={[{ label: t('breadcrumb'), href: '/products' }]}
      />

      <Container className="py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <FilterSidebar
            categories={categories}
            productCounts={productCounts}
            className="hidden self-start lg:block"
          />

          <div>
            <CatalogToolbar
              resultCount={totalDocs}
              basePath={basePath}
              searchParams={query}
              mobileFilters={
                <MobileFilters categories={categories} productCounts={productCounts} />
              }
            />
            {products.length > 0 ? (
              <ProductGrid products={products} className="mt-6" />
            ) : (
              <CatalogEmptyState basePath={basePath} hasFilters={hasFilters} className="mt-6" />
            )}
            <div className="mt-10">
              <Pagination
                basePath={basePath}
                searchParams={query}
                pages={totalPages}
                current={page}
              />
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}
