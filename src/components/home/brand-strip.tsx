import React from 'react'
import { Container } from '@/components/ui/container'
import { brands } from '@/lib/mock-data'

export function BrandStrip() {
  return (
    <section className="border-b border-line bg-white">
      <Container className="py-8">
        <p className="text-center text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
          Official partner of leading manufacturers
        </p>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {brands.map((brand) => (
            <li
              key={brand}
              className="font-display text-sm font-bold tracking-wide text-slate-300 uppercase transition-colors hover:text-slate-500 sm:text-base"
            >
              {brand}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
