import React from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { buttonVariants } from '@/components/ui/button'
import { Hero } from '@/components/home/hero'
import { CategoryShowcase } from '@/components/home/category-showcase'
import { Industries } from '@/components/home/industries'
import { CtaBanner } from '@/components/home/cta-banner'
import { ProductRail } from '@/components/product/product-rail'
import { bestsellers, newArrivals } from '@/lib/mock-data'

interface PageProps {
  params: Promise<{ locale: Locale }>
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('home')

  return (
    <>
      <Hero />

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
            action={<ViewAllLink />}
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
          <CategoryShowcase />
        </Container>
      </section>

      {/* Promotions */}
      {/* <section className="py-16 lg:py-20">
        <Container>
          <SectionHeading
            eyebrow="Czas ograniczony"
            title="Promocje"
            description="Zniżki na magazynie i sezonowe promocje – ceny obejmują gwarancję najniższej ceny z ostatnich 30 dni."
            action={<ViewAllLink />}
            className="mb-8"
          />
          <ProductRail products={promotions} />
        </Container>
      </section> */}

      {/* New arrivals */}
      <section className="py-12 lg:pt-16 lg:pb-20">
        <Container>
          <SectionHeading
            eyebrow={t('newArrivals.eyebrow')}
            title={t('newArrivals.title')}
            description={t('newArrivals.description')}
            action={<ViewAllLink />}
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

async function ViewAllLink() {
  const t = await getTranslations('home')

  return (
    <Link href="/products" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
      {t('viewAll')}
      <ArrowRight aria-hidden />
    </Link>
  )
}
