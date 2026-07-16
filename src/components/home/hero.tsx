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

      <Container className="relative grid items-center  gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <Badge variant="on-dark">
            <BadgeCheck className="size-3.5" aria-hidden />
            Dystrybutor od 2020 roku
          </Badge>

          <h1 className="font-display mt-6 text-4xl leading-[0.98] font-bold tracking-tight text-balance text-white sm:text-5xl xl:text-6xl">
            Technologie dla urządzeń{' '}
            <span className="bg-linear-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
              samoobsługowych
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Akceptory banknotów, walidatory monet i obudowy dla gamingu oraz vendingu, przetestowane
            i wysyłane w ciągu 24 godzin.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/products" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              Zobacz produkty
              <ArrowRight aria-hidden />
            </Link>
            <Link
              href="/contact"
              className={buttonVariants({ variant: 'outline-inverse', size: 'lg' })}
            >
              Skontaktuj się z nami
            </Link>
          </div>

          <dl className="mt-8 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-4">
            <div>
              <dt className="order-2 mt-1 text-xs leading-snug text-slate-400">Lat w branży</dt>
              <dd className="font-display order-1 text-2xl font-bold text-white sm:text-3xl">5+</dd>
            </div>

            <div>
              <dt className="order-2 mt-1 text-xs leading-snug text-slate-400">
                Sprzedanych urządzeń
              </dt>
              <dd className="font-display order-1 text-2xl font-bold text-white sm:text-3xl">
                1000+
              </dd>
            </div>
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
                <p className="text-xs font-semibold text-white">12-miesięczna gwarancja</p>
                <p className="text-[11px] text-slate-400">na wybrane produkty</p>
              </div>
            </div>
            <div className="absolute -right-1 bottom-12 flex items-center gap-2 rounded-2xl border border-white/10 bg-navy-900/80 px-4 py-3 shadow-lift backdrop-blur-md sm:right-2">
              <Truck className="size-5 text-brand-400" aria-hidden />
              <div>
                <p className="text-xs font-semibold text-white">Wysyłka w 24 godziny</p>
                <p className="text-[11px] text-slate-400">na cały świat</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
