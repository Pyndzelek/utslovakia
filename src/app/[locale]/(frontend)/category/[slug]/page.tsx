import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from '@/i18n/routing'
import { getPathname } from '@/i18n/navigation'
import { Container } from '@/components/ui/container'
import { CatalogToolbar } from '@/components/catalog/catalog-toolbar'
import { Pagination } from '@/components/catalog/pagination'
import { ProductGrid } from '@/components/product/product-grid'
import { CategoryHero } from '@/components/catalog/category-hero'
import { CategoryNavigation } from '@/components/catalog/category-navigation'
import { getCategories, getCategoryBySlug, getCategorySlugsByLocale } from '@/lib/data/categories'
import { getProductsByCategory } from '@/lib/data/products'
import { buildDynamicLanguageAlternates } from '@/lib/seo/alternates'
import { breadcrumbJsonLd } from '@/lib/seo/json-ld'

const PRODUCTS_PER_PAGE = 12
export const revalidate = 600

interface PageProps {
  params: Promise<{ locale: Locale; slug: string }>
}

export async function generateStaticParams() {
  const paramsByLocale = await Promise.all(
    routing.locales.map(async (locale) => {
      const categories = await getCategories(locale, 0)
      return categories.map((category) => ({ locale, slug: category.slug }))
    }),
  )

  return paramsByLocale.flat()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const category = await getCategoryBySlug(slug, locale)
  if (!category) return {}

  const image = typeof category.image === 'object' ? category.image : null
  const canonicalPath = getPathname({
    locale,
    href: { pathname: '/category/[slug]', params: { slug } },
  })
  const languages = await buildLanguageAlternates(category.id)

  return {
    title: category.name,
    description: category.description ?? undefined,
    alternates: {
      canonical: canonicalPath,
      languages,
    },
    openGraph: {
      type: 'website',
      url: canonicalPath,
      title: category.name,
      description: category.description ?? undefined,
      images: image?.url ? [{ url: image.url, alt: category.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: category.name,
      description: category.description ?? undefined,
      images: image?.url ? [image.url] : undefined,
    },
  }
}

//Todo: pagination and fix changing language on this page - switching from one to another does not change the slug causing an error
export default async function CategoryPage({ params }: PageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const category = await getCategoryBySlug(slug, locale)
  if (!category) notFound()
  const allCategories = await getCategories(locale, 0)

  const categoryProducts = await getProductsByCategory(category.id, locale)
  const pageCount = categoryProducts.length / PRODUCTS_PER_PAGE

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: 'Home', path: getPathname({ locale, href: '/' }) },
              { name: 'Categories', path: getPathname({ locale, href: '/category' }) },
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

      <CategoryHero category={category} />

      <CategoryNavigation categories={allCategories} currentSlug={category.slug} />

      <Container className="py-6 lg:py-12">
        <CatalogToolbar resultCount={categoryProducts.length} />
        <ProductGrid products={categoryProducts} className="mt-6 md:grid-cols-4" />
        <div className="mt-10">
          <Pagination pages={pageCount} />
        </div>
      </Container>
    </main>
  )
}

/** Builds `alternates.languages` from this category's per-locale slugs. */
async function buildLanguageAlternates(categoryId: number) {
  const slugsByLocale = await getCategorySlugsByLocale(categoryId)
  return buildDynamicLanguageAlternates('/category/[slug]', slugsByLocale)
}
