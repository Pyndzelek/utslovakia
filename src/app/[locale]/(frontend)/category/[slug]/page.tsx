import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { getPathname, redirect } from '@/i18n/navigation'
import { Container } from '@/components/ui/container'
import { FilterSidebar } from '@/components/catalog/filter-sidebar'
import { CatalogToolbar } from '@/components/catalog/catalog-toolbar'
import { MobileFilters } from '@/components/catalog/mobile-filters'
import { Pagination } from '@/components/catalog/pagination'
import { CatalogEmptyState } from '@/components/catalog/empty-state'
import { ProductGrid } from '@/components/product/product-grid'
import { CategoryHero } from '@/components/catalog/category-hero'
import { CategoryNavigation } from '@/components/catalog/category-navigation'
import {
  findCategorySlugInLocale,
  getCategories,
  getCategoryBySlug,
  getCategorySlugsByLocale,
} from '@/lib/data/categories'
import { getFilteredProducts } from '@/lib/data/products'
import { buildDynamicLanguageAlternates } from '@/lib/seo/alternates'
import { breadcrumbJsonLd, itemListJsonLd } from '@/lib/seo/json-ld'
import { metaDescription, ogDefaults } from '@/lib/seo/meta'

const PRODUCTS_PER_PAGE = 12
// Rendered per request: filters and pagination come from `searchParams`, which can't be
// combined with static pre-rendering. The Payload queries behind it are cached.

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>
  searchParams: Promise<{
    page?: string
    minPrice?: string
    maxPrice?: string
    sort?: string
    q?: string
    badge?: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const category = await getCategoryBySlug(slug, locale)
  if (!category) return {}

  const seoImage = typeof category.meta?.image === 'object' ? category.meta.image : null
  const fallbackImage = typeof category.image === 'object' ? category.image : null
  const image = seoImage ?? fallbackImage
  const title = category.meta?.title || category.name
  const description = category.meta?.description || metaDescription(category.description)
  const canonicalPath = getPathname({
    locale,
    href: { pathname: '/category/[slug]', params: { slug } },
  })
  const languages = await buildLanguageAlternates(category.id)

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages,
    },
    openGraph: {
      ...ogDefaults(locale),
      type: 'website',
      url: canonicalPath,
      title,
      description,
      images: image?.url ? [{ url: image.url, alt: category.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image?.url ? [image.url] : undefined,
    },
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const category = await getCategoryBySlug(slug, locale)
  if (!category) {
    // Category slugs are localized; the language switcher keeps the current one, so
    // send another locale's slug to this locale's URL for the same category.
    const localizedSlug = await findCategorySlugInLocale(slug, locale)
    if (!localizedSlug) notFound()
    return redirect({
      href: { pathname: '/category/[slug]', params: { slug: localizedSlug } },
      locale,
    })
  }
  const t = await getTranslations('nav')
  const allCategories = await getCategories(locale, 0)

  const query = await searchParams
  const page = query.page ? parseInt(query.page, 10) : 1
  const minPrice = query.minPrice ? parseFloat(query.minPrice) : undefined
  const maxPrice = query.maxPrice ? parseFloat(query.maxPrice) : undefined

  const {
    docs: categoryProducts,
    totalPages,
    totalDocs,
  } = await getFilteredProducts(locale, {
    categoryIds: category.id,
    page,
    limit: PRODUCTS_PER_PAGE,
    minPrice,
    maxPrice,
    sort: query.sort,
    search: query.q,
    badges: query.badge?.split(','),
  })

  const basePath = getPathname({
    locale,
    href: { pathname: '/category/[slug]', params: { slug: category.slug } },
  })
  const hasFilters = Boolean(query.q || query.badge || query.minPrice || query.maxPrice || page > 1)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: t('home'), path: getPathname({ locale, href: '/' }) },
              { name: t('category'), path: getPathname({ locale, href: '/category' }) },
              {
                name: category.name,
                path: getPathname({
                  locale,
                  href: { pathname: '/category/[slug]', params: { slug: category.slug } },
                }),
              },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            itemListJsonLd({
              items: categoryProducts.map((product) => ({
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

      <CategoryHero category={category} />

      <CategoryNavigation categories={allCategories} currentSlug={category.slug} />

      <Container className="py-6 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <FilterSidebar showCategoryFilter={false} className="hidden self-start lg:block" />

          <div>
            <CatalogToolbar
              resultCount={totalDocs}
              basePath={basePath}
              searchParams={query}
              mobileFilters={<MobileFilters showCategoryFilter={false} />}
            />
            {categoryProducts.length > 0 ? (
              <ProductGrid products={categoryProducts} className="mt-6" />
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

/** Builds `alternates.languages` from this category's per-locale slugs. */
async function buildLanguageAlternates(categoryId: number) {
  const slugsByLocale = await getCategorySlugsByLocale(categoryId)
  return buildDynamicLanguageAlternates('/category/[slug]', slugsByLocale)
}
