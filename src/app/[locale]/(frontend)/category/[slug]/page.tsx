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
import { getProductsByCategory } from '@/lib/mock-data'
import { SITE_URL } from '@/lib/site'
import type { Category } from '@/payload-types'

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

export default async function CategoryPage({ params }: PageProps) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const category = await getCategoryBySlug(slug, locale)
  if (!category) notFound()
  const allCategories = await getCategories(locale, 0)

  // TODO: swap for real Payload `products` data once that collection's data
  const categoryProducts = getProductsByCategory(category.slug)
  const pageCount = Math.max(1, Math.ceil(categoryProducts.length / PRODUCTS_PER_PAGE))

  return (
    <main>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(locale, category)) }}
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

  return Object.fromEntries(
    (Object.entries(slugsByLocale) as [Locale, string | undefined][])
      .filter((entry): entry is [Locale, string] => Boolean(entry[1]))
      .map(([entryLocale, entrySlug]) => [
        entryLocale,
        getPathname({
          locale: entryLocale,
          href: { pathname: '/category/[slug]', params: { slug: entrySlug } },
        }),
      ]),
  )
}

function breadcrumbJsonLd(locale: Locale, category: Category) {
  const absoluteUrl = (path: string) => `${SITE_URL}${path}`

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl(getPathname({ locale, href: '/' })),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Categories',
        item: absoluteUrl(getPathname({ locale, href: '/category' })),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: absoluteUrl(
          getPathname({
            locale,
            href: { pathname: '/category/[slug]', params: { slug: category.slug } },
          }),
        ),
      },
    ],
  }
}
