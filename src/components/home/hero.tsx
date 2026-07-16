import React from 'react'
import Image from 'next/image'
import { ArrowRight, BadgeCheck, ShieldCheck, Truck } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { companyStats, PRODUCT_IMAGE } from '@/lib/mock-data'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy-950">
      <div className="pattern-chevron-dark absolute inset-0" aria-hidden />
      {/* Blue glow behind the product */}
      <div
        className="absolute top-1/2 right-[-10%] size-[620px] -translate-y-1/2 rounded-full bg-brand-600/25 blur-3xl"
        aria-hidden
      />

      <Container className="relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <Badge variant="on-dark">
            <BadgeCheck className="size-3.5" aria-hidden />
            Authorized distributor since 2009
          </Badge>

          <h1 className="font-display mt-6 text-4xl leading-[1.08] font-bold tracking-tight text-balance text-white sm:text-5xl xl:text-6xl">
            Payment hardware for machines that{' '}
            <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
              never sleep
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Bill acceptors, coin validators, touch monitors and cashless modules for gaming, vending
            and amusement — bench-tested in Bratislava and dispatched across Europe within 24 hours.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/products" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              Browse products
              <ArrowRight aria-hidden />
            </Link>
            <Link href="/contact" className={buttonVariants({ variant: 'outline-inverse', size: 'lg' })}>
              Talk to an engineer
            </Link>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {companyStats.slice(0, 3).map((stat) => (
              <div key={stat.label}>
                <dt className="order-2 mt-1 text-xs leading-snug text-slate-400">{stat.label}</dt>
                <dd className="font-display order-1 text-2xl font-bold text-white sm:text-3xl">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Product visual */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-square">
            <div
              className="absolute inset-6 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-sm"
              aria-hidden
            />
            <Image
              src={PRODUCT_IMAGE}
              alt="JCM UBA-10 bill validator"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 560px"
              className="object-contain p-14 drop-shadow-[0_32px_48px_rgba(0,0,0,0.55)]"
            />

            {/* Floating spec chips */}
            <div className="absolute top-10 -left-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-navy-900/80 px-4 py-3 shadow-lift backdrop-blur-md sm:left-2">
              <ShieldCheck className="size-5 text-brand-400" aria-hidden />
              <div>
                <p className="text-xs font-semibold text-white">24-month warranty</p>
                <p className="text-[11px] text-slate-400">Local service centre</p>
              </div>
            </div>
            <div className="absolute -right-1 bottom-12 flex items-center gap-2 rounded-2xl border border-white/10 bg-navy-900/80 px-4 py-3 shadow-lift backdrop-blur-md sm:right-2">
              <Truck className="size-5 text-brand-400" aria-hidden />
              <div>
                <p className="text-xs font-semibold text-white">Dispatch in 24 h</p>
                <p className="text-[11px] text-slate-400">From Bratislava warehouse</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
