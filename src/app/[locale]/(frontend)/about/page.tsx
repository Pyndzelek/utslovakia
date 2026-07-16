import React from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { setRequestLocale } from 'next-intl/server'
import { ArrowRight, Handshake, PackageCheck, Wrench, Zap } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { Container } from '@/components/ui/container'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { SectionHeading } from '@/components/ui/section-heading'
import { buttonVariants } from '@/components/ui/button'
import { BrandStrip } from '@/components/home/brand-strip'
import { companyStats, PRODUCT_IMAGE } from '@/lib/mock-data'

export const metadata: Metadata = {
  title: 'About us',
  description:
    'UT Slovakia has supplied and serviced payment systems for gaming, vending and amusement operators across Europe since 2009.',
}

const values = [
  {
    Icon: Zap,
    title: 'Engineering first',
    text: 'Every salesperson here has held a screwdriver. We spec devices against your cabinet, harness and firmware — not against a price list.',
  },
  {
    Icon: PackageCheck,
    title: 'Stock that ships',
    text: 'Over 4,000 devices and parts on shelves in Bratislava. If it is on the site, it is in the building — and dispatched within 24 hours.',
  },
  {
    Icon: Wrench,
    title: 'Service in-house',
    text: 'Our certified technicians repair, calibrate and update validators on site. Typical turnaround is five working days, loaners available.',
  },
  {
    Icon: Handshake,
    title: 'Long-term partnership',
    text: '98% of our customers order again. We grow when your machines earn — so we optimise for uptime, not one-off sales.',
  },
]

const timeline = [
  {
    year: '2009',
    title: 'Founded in Bratislava',
    text: 'Two engineers, one van and a contract to service coin acceptors for a local amusement operator.',
  },
  {
    year: '2013',
    title: 'First distribution agreement',
    text: 'Became an authorized distributor for a major Japanese validator manufacturer for Central Europe.',
  },
  {
    year: '2017',
    title: 'In-house service centre',
    text: 'Opened a certified repair and calibration workshop, cutting typical turnaround from weeks to days.',
  },
  {
    year: '2021',
    title: 'New warehouse & logistics hub',
    text: 'Moved to a 2,400 m² facility with same-day dispatch across the EU and next-day delivery to five countries.',
  },
  {
    year: '2025',
    title: 'Cashless & telemetry line',
    text: 'Added EMV cashless readers and remote-management modules to bring legacy fleets into the contactless era.',
  },
]

interface PageProps {
  params: Promise<{ locale: Locale }>
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950">
        <div className="pattern-chevron-dark absolute inset-0" aria-hidden />
        <div
          className="absolute top-0 right-0 size-[480px] translate-x-1/4 -translate-y-1/4 rounded-full bg-brand-600/25 blur-3xl"
          aria-hidden
        />
        <Container className="relative py-16 lg:py-24">
          <Breadcrumbs
            items={[{ label: 'About us' }]}
            className="[&_a]:text-slate-400 [&_a:hover]:text-white [&_span]:text-white"
          />
          <h1 className="font-display mt-6 max-w-3xl text-4xl leading-[1.1] font-bold tracking-tight text-balance text-white sm:text-5xl">
            Fifteen years keeping Europe&apos;s machines earning
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            UT Slovakia supplies and services the payment hardware inside betting terminals, slot
            cabinets, vending machines and car washes across the continent — from a single warehouse
            and workshop in Bratislava.
          </p>

          <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-8 border-t border-white/10 pt-8 sm:grid-cols-4">
            {companyStats.map((stat) => (
              <div key={stat.label}>
                <dd className="font-display text-3xl font-bold text-white">{stat.value}</dd>
                <dt className="mt-1 text-xs leading-snug text-slate-400">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Story */}
      <section className="bg-white py-16 lg:py-20">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Our story"
              title="From a repair van to a European distribution hub"
              className="mb-6"
            />
            <div className="space-y-4 text-[15px] leading-relaxed text-slate-600">
              <p>
                We started in 2009 fixing coin acceptors that other suppliers had written off. That
                habit never left: before any device reaches our shelves, it passes the same bench
                tests we use in the repair shop. What ships is what works.
              </p>
              <p>
                Today we hold distribution agreements with the industry&apos;s leading manufacturers
                and keep more than four thousand devices in stock. Operators in eleven countries rely
                on us for hardware, currency firmware, spare parts and repairs — usually from a
                single phone call.
              </p>
              <p>
                We stayed deliberately small where it matters: you talk to an engineer, not a ticket
                queue, and the person who sells you a validator can also tell you why your old one
                rejected worn banknotes.
              </p>
            </div>
            <div className="mt-8">
              <Link href="/contact" className={buttonVariants({ variant: 'primary', size: 'md' })}>
                Get in touch
                <ArrowRight aria-hidden />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="pattern-chevron-light relative overflow-hidden rounded-3xl bg-brand-50 p-10">
              <Image
                src={PRODUCT_IMAGE}
                alt="Bill validator on the test bench"
                width={520}
                height={520}
                className="mx-auto drop-shadow-[0_32px_40px_rgba(14,23,50,0.25)]"
              />
            </div>
            <div className="absolute -bottom-5 left-6 rounded-2xl bg-navy-900 px-5 py-4 shadow-lift">
              <p className="font-display text-2xl font-bold text-white">2,400 m²</p>
              <p className="text-xs text-slate-400">warehouse & workshop</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-20">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="How we work"
            title="What you can hold us to"
            className="mb-10"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {values.map(({ Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="font-display mt-5 text-base font-semibold text-navy-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Timeline */}
      <section className="bg-white py-16 lg:py-20">
        <Container>
          <SectionHeading eyebrow="Milestones" title="The road so far" className="mb-12" />
          <ol className="relative space-y-10 border-l border-line pl-8 lg:space-y-12">
            {timeline.map((item) => (
              <li key={item.year} className="relative">
                <span
                  className="absolute top-1 -left-[41px] size-4 rounded-full border-4 border-white bg-brand-600 shadow-card"
                  aria-hidden
                />
                <p className="font-display text-sm font-bold tracking-wide text-brand-600">{item.year}</p>
                <h3 className="font-display mt-1 text-lg font-semibold text-navy-900">{item.title}</h3>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-500">{item.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <BrandStrip />

      {/* CTA */}
      <section className="py-16 lg:py-20">
        <Container>
          <div className="pattern-chevron-dark relative overflow-hidden rounded-3xl bg-navy-950 px-8 py-12 text-center shadow-lift sm:px-12 lg:py-16">
            <div
              className="absolute top-1/2 left-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/25 blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <h2 className="font-display mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
                Tell us what your machines need to accept
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-300">
                Coins, notes, cards or phones — we&apos;ll recommend the exact hardware, flash the
                right firmware and have it on your bench tomorrow.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link href="/contact" className={buttonVariants({ variant: 'inverse', size: 'lg' })}>
                  Contact us
                  <ArrowRight aria-hidden />
                </Link>
                <Link href="/products" className={buttonVariants({ variant: 'outline-inverse', size: 'lg' })}>
                  Browse products
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
