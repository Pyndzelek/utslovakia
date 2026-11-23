import React from 'react'
import { Container } from '@/components/ui/container'

interface StatusHeroProps {
  /** Small icon shown in the eyebrow pill. */
  icon: React.ReactNode
  eyebrow: string
  title: string
  description: string
  /** Action buttons under the description. */
  children?: React.ReactNode
}

/**
 * Dark full-width banner for pages that replace the content the visitor asked for
 * (404, unexpected error). No hooks, so server and client components can both render it.
 */
export function StatusHero({ icon, eyebrow, title, description, children }: StatusHeroProps) {
  return (
    <section className="relative overflow-hidden bg-navy-950">
      <div className="pattern-chevron-dark absolute inset-0" aria-hidden />
      <div
        className="absolute top-1/2 left-1/2 size-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/20 blur-3xl"
        aria-hidden
      />
      <Container className="relative flex flex-col items-center py-20 text-center lg:py-28">
        <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-brand-300 uppercase">
          {icon}
          {eyebrow}
        </span>
        <h1 className="font-display mt-6 max-w-2xl text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-300">{description}</p>
        {children && <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>}
      </Container>
    </section>
  )
}
