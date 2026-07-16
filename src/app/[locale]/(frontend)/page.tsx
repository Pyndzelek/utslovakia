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

      {/* Industries */}
      <section className="bg-white pt-16 lg:py-12">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Komu dostarczamy"
            title="Obsługiwane branże"
            description="Jeden dostawca do każdego punktu płatności samoobsługowej w Twoim biznesie."
            className="mb-10"
          />
          <Industries />
        </Container>
      </section>

      {/* Bestsellers */}
      <section className="py-12 lg:py-16">
        <Container>
          <SectionHeading
            eyebrow="Najczęściej zamawiane"
            title="Bestsellery"
            description="Urządzenia, które nasze klienci zamawiają ponownie, w magazynie i gotowe do wysyłki."
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
            eyebrow="Przeglądaj katalog"
            title="Znajdź odpowiednie komponenty"
            description="Od walidacji banknotów do retrofitów bezgotówkowych – wszystko, co potrzebuje maszyna samoobsługowa."
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
            eyebrow="Nowości"
            title="Nowe produkty"
            description="Ostatnio dodane do katalogu i gotowe do wysyłki."
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

function ViewAllLink() {
  return (
    <Link href="/products" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
      Zobacz wszystkie
      <ArrowRight aria-hidden />
    </Link>
  )
}
