import React from 'react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { Link, getPathname } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { buttonVariants } from '@/components/ui/button'
import { Hero } from '@/components/home/hero'
import { CategoryShowcase } from '@/components/home/category-showcase'
import { Industries } from '@/components/home/industries'
import { CtaBanner } from '@/components/home/cta-banner'
import { ProductRail } from '@/components/product/product-rail'
import { getBestsellers, getNewArrivals } from '@/lib/data/products'
import { buildStaticLanguageAlternates } from '@/lib/seo/alternates'
import { ogDefaults } from '@/lib/seo/meta'

export const revalidate = 600

interface PageProps {
  params: Promise<{ locale: Locale }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  // Title/description come from the layout defaults; only the URLs are page-specific.
  return {
    alternates: {
      canonical: getPathname({ locale, href: '/' }),
      languages: buildStaticLanguageAlternates('/'),
    },
    openGraph: { ...ogDefaults(locale), url: getPathname({ locale, href: '/' }) },
  }
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('home')
  const [bestsellers, newArrivals] = await Promise.all([
    getBestsellers(locale),
    getNewArrivals(locale),
  ])

  return (
    <>
      <Hero locale={locale} />

      {/* Industries */}
      <section className="bg-white pt-16 lg:py-12">
        <Container>
          <SectionHeading
            align="center"
            eyebrow={t('industries.eyebrow')}
            title={t('industries.title')}
            description={t('industries.description')}
            className="mb-10"
          />
          <Industries />
        </Container>
      </section>

      {/* Bestsellers */}
      <section className="py-12 lg:py-16">
        <Container>
          <SectionHeading
            eyebrow={t('bestsellers.eyebrow')}
            title={t('bestsellers.title')}
            description={t('bestsellers.description')}
            action={
              <ViewAllLink href={{ pathname: '/products', query: { badge: 'bestseller' } }} />
            }
            className="mb-8"
          />
          <ProductRail products={bestsellers} />
        </Container>
      </section>

      {/* Category showcase */}
      <section className="bg-white py-12 lg:py-16">
        <Container>
          <SectionHeading
            eyebrow={t('categories.eyebrow')}
            title={t('categories.title')}
            description={t('categories.description')}
            className="mb-10"
          />
          <CategoryShowcase locale={locale} />
        </Container>
      </section>

      {/* New arrivals */}
      <section className="py-12 lg:pt-16 lg:pb-20">
        <Container>
          <SectionHeading
            eyebrow={t('newArrivals.eyebrow')}
            title={t('newArrivals.title')}
            description={t('newArrivals.description')}
            action={<ViewAllLink href="/products" />}
            className="mb-8"
          />
          <ProductRail products={newArrivals} />
        </Container>
      </section>

      {/* CTA */}
      <section className="pb-12 lg:pb-16">
        <Container>
          <CtaBanner />
        </Container>
      </section>
    </>
  )
}

async function ViewAllLink({ href }: { href: React.ComponentProps<typeof Link>['href'] }) {
  const t = await getTranslations('home')

  return (
    <Link href={href} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
      {t('viewAll')}
      <ArrowRight aria-hidden />
    </Link>
  )
}
