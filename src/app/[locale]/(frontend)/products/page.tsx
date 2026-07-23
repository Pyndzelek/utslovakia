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

interface PageProps {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'products.meta' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function ProductsPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('products')

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
            <CatalogToolbar resultCount={products.length} />
            <ProductGrid products={products} className="mt-6" />
            <div className="mt-10">
              <Pagination />
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}
