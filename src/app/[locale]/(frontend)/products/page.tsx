import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { getPathname } from '@/i18n/navigation'
import { Container } from '@/components/ui/container'
import { ActiveFilters } from '@/components/catalog/active-filters'
import { CatalogResults, CatalogTransition } from '@/components/catalog/catalog-transition'
import { FilterSidebar } from '@/components/catalog/filter-sidebar'
import { CatalogToolbar } from '@/components/catalog/catalog-toolbar'
import { MobileFilters } from '@/components/catalog/mobile-filters'
import { Pagination } from '@/components/catalog/pagination'
import { CatalogEmptyState } from '@/components/catalog/empty-state'
import { ProductGrid } from '@/components/product/product-grid'
import PageHeader from '@/components/layout/page-header'
import {
  activeFilterCount,
  buildListingHref,
  isNarrowed,
  parseCatalogParams,
  toQueryRecord,
  type RawSearchParams,
} from '@/lib/catalog-params'
import { getBrandsWithCounts } from '@/lib/data/brands'
import { getFilteredProducts, getProductCountsByCategory } from '@/lib/data/products'
import { getCategories } from '@/lib/data/categories'
import { buildStaticLanguageAlternates } from '@/lib/seo/alternates'
import { itemListJsonLd } from '@/lib/seo/json-ld'

export const revalidate = 300

interface PageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<RawSearchParams>
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const query = parseCatalogParams(await searchParams)
  const t = await getTranslations({ locale, namespace: 'products.meta' })
  const basePath = getPathname({ locale, href: '/products' })
  const narrowed = isNarrowed(query)

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      // Later pages of the plain listing are their own documents.
      canonical:
        !narrowed && query.page > 1
          ? buildListingHref(basePath, { page: String(query.page) })
          : basePath,
      languages: buildStaticLanguageAlternates('/products'),
    },
    // Search results and filter combinations are endless near-duplicates of the listing.
    robots: narrowed ? { index: false, follow: true } : undefined,
  }
}

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('products')
  const tHome = await getTranslations('home')

  const query = parseCatalogParams(await searchParams)
  const { page } = query
  // The home page's Bestsellers "View all" lands here — title the page to match.
  const bestsellersOnly = query.badges.length === 1 && query.badges[0] === 'bestseller'

  // Fetch paginated & filtered data
  const [{ docs: products, totalPages, totalDocs }, categories, productCounts, brands] =
    await Promise.all([
      getFilteredProducts(locale, {
        page,
        limit: 12,
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        categoryIds: query.categoryIds.length ? query.categoryIds : undefined,
        brandIds: query.brandIds,
        inStock: query.inStock,
        sort: query.sort,
        search: query.q,
        badges: query.badges,
      }),
      getCategories(locale, 0),
      getProductCountsByCategory(locale),
      getBrandsWithCounts(),
    ])

  const basePath = getPathname({ locale, href: '/products' })
  const hasFilters = isNarrowed(query) || page > 1
  const filterCount = activeFilterCount(query)

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
        title={bestsellersOnly ? tHome('bestsellers.title') : t('title')}
        description={bestsellersOnly ? tHome('bestsellers.description') : t('description')}
        breadcrumbs={[{ label: t('breadcrumb'), href: '/products' }]}
      />

      <Container className="py-8 lg:py-10">
        <CatalogTransition>
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <FilterSidebar
              categories={categories}
              brands={brands}
              productCounts={productCounts}
              className="hidden self-start lg:block"
            />

            <div>
              <CatalogToolbar
                resultCount={totalDocs}
                basePath={basePath}
                params={query}
                mobileFilters={
                  <MobileFilters
                    categories={categories}
                    brands={brands}
                    productCounts={productCounts}
                    resultCount={totalDocs}
                    activeCount={filterCount}
                  />
                }
              />
              <ActiveFilters
                basePath={basePath}
                params={query}
                categories={categories}
                brands={brands}
                className="mt-4"
              />
              <CatalogResults className="mt-6">
                {products.length > 0 ? (
                  <ProductGrid products={products} />
                ) : (
                  <CatalogEmptyState basePath={basePath} hasFilters={hasFilters} />
                )}
              </CatalogResults>
              <div className="mt-10">
                <Pagination
                  basePath={basePath}
                  searchParams={toQueryRecord(query)}
                  pages={totalPages}
                  current={page}
                />
              </div>
            </div>
          </div>
        </CatalogTransition>
      </Container>
    </>
  )
}
