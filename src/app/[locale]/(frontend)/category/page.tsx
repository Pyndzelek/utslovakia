import { Suspense } from 'react'
import { setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { Container } from '@/components/ui/container'
import { CtaBanner } from '@/components/home/cta-banner'
import { Skeleton } from '@/components/ui/skeleton'
import { getCategories } from '@/lib/data/categories'
import { getProductCountsByCategory } from '@/lib/data/products'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import PageHeader from '@/components/layout/page-header'
import CategoryCard from '@/components/catalog/category-card'
import { RevealOnScroll } from '@/components/ui/reveal'
import { getPathname } from '@/i18n/navigation'
import { buildStaticLanguageAlternates } from '@/lib/seo/alternates'
import { itemListJsonLd } from '@/lib/seo/json-ld'

// Pages are pre-rendered per locale at build time (locales come from the
// layout's generateStaticParams); ISR keeps them fresh when categories change.
export const revalidate = 600

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'category.meta' })
  const canonicalPath = getPathname({ locale, href: '/category' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: canonicalPath,
      languages: buildStaticLanguageAlternates('/category'),
    },
  }
}

interface PageProps {
  params: Promise<{ locale: Locale }>
}

export default async function CategoryIndexPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('category')
  const categories = await getCategories(locale)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            itemListJsonLd({
              items: categories.map((category) => ({
                name: category.name,
                path: getPathname({
                  locale,
                  href: { pathname: '/category/[slug]', params: { slug: category.slug } },
                }),
              })),
            }),
          ),
        }}
      />

      <PageHeader
        title={t('title')}
        description={t('description')}
        breadcrumbs={[{ label: t('breadcrumb'), href: '/category' }]}
      />

      <Container className="py-10 lg:py-14">
        {/* Header/CTA don't depend on Payload data, so only this grid — the
            slow part — suspends and shows a skeleton while it loads. */}
        <Suspense fallback={<CategoryGridSkeleton />}>
          <CategoryGrid locale={locale} />
        </Suspense>

        <CtaBanner />
      </Container>
    </>
  )
}

async function CategoryGrid({ locale }: { locale: Locale }) {
  const [categories, productCounts] = await Promise.all([
    getCategories(locale),
    getProductCountsByCategory(locale),
  ])

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 mb-14">
      {categories.map((category, index) => (
        <RevealOnScroll key={category.slug} index={index}>
          <CategoryCard category={category} productCount={productCounts.get(category.id) ?? 0} />
        </RevealOnScroll>
      ))}
    </div>
  )
}

function CategoryGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 mb-14">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col rounded-3xl border border-line bg-white p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-6 w-3/4" />
            </div>
            <Skeleton className="size-10 shrink-0 rounded-full" />
          </div>
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="mt-6 h-40 rounded-2xl" />
        </div>
      ))}
    </div>
  )
}
