import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { Container } from '@/components/ui/container'
import { FilterSidebar } from '@/components/catalog/filter-sidebar'
import { CatalogToolbar } from '@/components/catalog/catalog-toolbar'
import { Pagination } from '@/components/catalog/pagination'
import { ProductGrid } from '@/components/product/product-grid'
import { products } from '@/lib/mock-data'
import PageHeader from '@/components/layout/page-header'
import { getFilteredProducts } from '@/lib/data/products'

interface PageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{
    page?: string
    minPrice?: string
    maxPrice?: string
    category?: string
    sort?: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'products.meta' })

  return {
    title: t('title'),
    description: t('description'),
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
  const {
    docs: products,
    totalPages,
    totalDocs,
  } = await getFilteredProducts(locale, {
    page,
    limit: 12,
    minPrice,
    maxPrice,
    categoryIds,
    sort: query.sort || '-createdAt',
  })

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
        breadcrumbs={[{ label: t('breadcrumb'), href: '/products' }]}
      />

      <Container className="py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <FilterSidebar className="hidden self-start lg:block" />

          <div>
            <CatalogToolbar resultCount={totalDocs} />
            <ProductGrid products={products} className="mt-6" />
            <div className="mt-10">
              <Pagination pages={totalPages} />
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}
