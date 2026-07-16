import React from 'react'
import Image from 'next/image'
import { ArrowRight, Headset, PackageCheck, Wrench } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { buttonVariants } from '@/components/ui/button'
import { PRODUCT_IMAGE } from '@/lib/mock-data'

const services = [
  { Icon: Headset, label: 'Pre-sales engineering advice' },
  { Icon: Wrench, label: 'In-house repair & calibration' },
  { Icon: PackageCheck, label: 'Every unit bench-tested' },
]

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-navy-950 shadow-lift">
      <div className="pattern-chevron-dark absolute inset-0" aria-hidden />
      <div
        className="absolute -right-24 -bottom-32 size-96 rounded-full bg-brand-600/30 blur-3xl"
        aria-hidden
      />

      <div className="relative grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-[1.2fr_0.8fr] lg:p-16">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-brand-300 uppercase">
            More than a parts shop
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
            Hardware, firmware and service — from one partner
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-300">
            Our engineers help you choose the right validator, flash the correct currency set and
            keep your fleet earning. If something fails, our Bratislava service centre repairs it —
            usually within five working days.
          </p>

          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {services.map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-slate-200">
                <Icon className="size-4 text-brand-400" aria-hidden />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/about" className={buttonVariants({ variant: 'inverse', size: 'md' })}>
              Read more about us
              <ArrowRight aria-hidden />
            </Link>
            <Link href="/contact" className={buttonVariants({ variant: 'outline-inverse', size: 'md' })}>
              Contact us
            </Link>
          </div>
        </div>

        <div className="relative hidden aspect-square max-h-80 lg:block">
          <Image
            src={PRODUCT_IMAGE}
            alt=""
            fill
            sizes="360px"
            className="object-contain drop-shadow-[0_32px_48px_rgba(0,0,0,0.55)]"
          />
        </div>
      </div>
    </section>
  )
}
