import { setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { Container } from '@/components/ui/container'
import { CtaBanner } from '@/components/home/cta-banner'
import { categories } from '@/lib/mock-data'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import PageHeader from '@/components/layout/page-header'
import CategoryCard from '@/components/catalog/category-card'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'category.meta' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

interface PageProps {
  params: Promise<{ locale: Locale }>
}

export default async function CategoryIndexPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('category')

  return (
    <>
      <PageHeader
        title={t('title')}
        description={t('description')}
        breadcrumbs={[{ label: t('breadcrumb'), href: '/category' }]}
      />

      <Container className="py-10 lg:py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 mb-14">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>

        <CtaBanner />
      </Container>
    </>
  )
}
