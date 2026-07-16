import React from 'react'
import { setRequestLocale } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { Container } from '@/components/ui/container'
import { SectionHeading } from '@/components/ui/section-heading'
import { buttonVariants } from '@/components/ui/button'
import { Hero } from '@/components/home/hero'
import { BrandStrip } from '@/components/home/brand-strip'
import { CategoryShowcase } from '@/components/home/category-showcase'
import { Industries } from '@/components/home/industries'
import { CtaBanner } from '@/components/home/cta-banner'
import { ProductRail } from '@/components/product/product-rail'
import { bestsellers, newArrivals, promotions } from '@/lib/mock-data'

interface PageProps {
  params: Promise<{ locale: Locale }>
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      <Hero />
      <BrandStrip />

      {/* Bestsellers */}
      <section className="py-16 lg:py-20">
        <Container>
          <SectionHeading
            eyebrow="Proven in the field"
            title="Bestsellers"
            description="The devices our customers order again and again — stocked deep and ready to ship."
            action={<ViewAllLink />}
            className="mb-8"
          />
          <ProductRail products={bestsellers} />
        </Container>
      </section>

      {/* Category showcase */}
      <section className="bg-white py-16 lg:py-20">
        <Container>
          <SectionHeading
            eyebrow="Browse the catalog"
            title="Find the right component"
            description="From banknote validation to cashless retrofits — everything a self-service machine needs."
            className="mb-10"
          />
          <CategoryShowcase />
        </Container>
      </section>

      {/* Promotions */}
      <section className="py-16 lg:py-20">
        <Container>
          <SectionHeading
            eyebrow="Limited-time offers"
            title="Promotions"
            description="Clearance stock and seasonal discounts — prices include the lowest-price guarantee of the last 30 days."
            action={<ViewAllLink />}
            className="mb-8"
          />
          <ProductRail products={promotions} />
        </Container>
      </section>

      {/* Industries */}
      <section className="bg-white py-16 lg:py-20">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Who we supply"
            title="Browse by industry"
            description="One supplier for every unattended payment point in your operation."
            className="mb-10"
          />
          <Industries />
        </Container>
      </section>

      {/* New arrivals */}
      <section className="py-16 lg:py-20">
        <Container>
          <SectionHeading
            eyebrow="Fresh off the bench"
            title="New products"
            description="Recently added to the catalog and already bench-tested by our engineers."
            action={<ViewAllLink />}
            className="mb-8"
          />
          <ProductRail products={newArrivals} />
        </Container>
      </section>

      {/* CTA */}
      <section className="pb-16 lg:pb-24">
        <Container>
          <CtaBanner />
        </Container>
      </section>
    </>
  )
}

function ViewAllLink() {
  return (
    <Link href="/products" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
      View all
      <ArrowRight aria-hidden />
    </Link>
  )
}
