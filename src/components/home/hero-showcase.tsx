'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ArrowUpRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import type { HeroSlide } from '@/lib/data/site-settings'

const INTERVAL_MS = 5000
const EASE_OUT = 'cubic-bezier(.2,.7,.2,1)'
/** Longest word that fits the left column at full size; longer ones scale down. */
const WORD_FIT_CHARS = 7

/** Staggered entrance for hero content (tw-animate-css; the global reduced-motion rule neutralises it). */
export const heroEnter = 'animate-in fade-in fill-mode-both duration-700 ease-out'

/** Offset for a slide that isn't active: previous ones exit one way, upcoming ones wait on the other. */
const offset = (i: number, active: number, px: number) =>
  i === active ? '0px' : `${i < active ? -px : px}px`

interface HeroShowcaseProps {
  slides: HeroSlide[]
  badge: React.ReactNode
  /** Headline + lead paragraph, rendered under the rotating word. */
  intro: React.ReactNode
  actions: React.ReactNode
  /** Shown instead of the product stage when there are no slides. */
  fallbackVisual: React.ReactNode
}

export function HeroShowcase({ slides, badge, intro, actions, fallbackVisual }: HeroShowcaseProps) {
  const t = useTranslations('home.hero')
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  // Bumped on manual selection so the autoplay timer restarts from zero.
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (slides.length < 2 || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setActive((a) => (a + 1) % slides.length), INTERVAL_MS)
    return () => clearInterval(id)
  }, [slides.length, paused, cycle])

  const select = (i: number) => {
    setActive(i)
    setCycle((c) => c + 1)
  }

  const current = slides[active]
  const longestWord = Math.max(0, ...slides.map((s) => s.word.length))
  const wordScale = Math.min(1, WORD_FIT_CHARS / Math.max(longestWord, 1))
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div
      className="flex flex-wrap items-center gap-x-14 gap-y-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false)
      }}
    >
      <div className="max-w-[540px] min-w-0 flex-[1_1_400px]">
        <div className={cn(heroEnter, 'slide-in-from-bottom-2')}>{badge}</div>

        {slides.length > 0 && (
          <div
            aria-hidden
            className={cn(heroEnter, 'slide-in-from-bottom-4 mt-5 grid delay-100 sm:mt-6')}
          >
            {slides.map((slide, i) => (
              <div
                key={i}
                className="font-display col-start-1 row-start-1 leading-none font-extrabold tracking-[-0.055em] whitespace-nowrap text-navy-900"
                style={{
                  fontSize: `calc(clamp(2.75rem, 11vw, 7.5rem) * ${wordScale})`,
                  opacity: i === active ? 1 : 0,
                  transform: `translateY(${offset(i, active, 40)})`,
                  transition: `opacity 600ms ease, transform 800ms ${EASE_OUT}`,
                }}
              >
                {slide.word}
                <span className="text-brand-600">.</span>
              </div>
            ))}
          </div>
        )}

        <div className={cn(heroEnter, 'slide-in-from-bottom-4 delay-200')}>{intro}</div>

        {slides.length > 0 && (
          <ul
            aria-label={t('slidesLabel')}
            className={cn(
              heroEnter,
              'slide-in-from-bottom-4 mt-7 border-t border-navy-900/10 delay-300',
            )}
          >
            {slides.map((slide, i) => {
              const isActive = i === active
              return (
                <li key={i} className="flex items-center gap-4 border-b border-navy-900/10">
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => select(i)}
                    className="flex min-w-0 flex-1 cursor-pointer items-baseline gap-4 py-3 text-left outline-brand-500 focus-visible:outline-2"
                  >
                    <span
                      className={cn(
                        'font-display w-5 shrink-0 text-[11px] font-semibold transition-colors duration-300',
                        isActive ? 'text-brand-600' : 'text-slate-400',
                      )}
                    >
                      {pad(i + 1)}
                    </span>
                    <span
                      className={cn(
                        'font-display truncate text-base font-semibold transition-colors duration-300',
                        isActive ? 'text-navy-900' : 'text-slate-500',
                      )}
                    >
                      {slide.category.name}
                    </span>
                    {slide.price && (
                      <span className="ml-auto shrink-0 text-xs text-slate-500">{slide.price}</span>
                    )}
                  </button>
                  <Link
                    href={{ pathname: '/category/[slug]', params: { slug: slide.category.slug } }}
                    aria-label={t('openCategory', { name: slide.category.name })}
                    className={cn(
                      'grid size-8 shrink-0 place-items-center rounded-full transition-colors duration-300',
                      isActive
                        ? 'bg-brand-600 text-white hover:bg-brand-700'
                        : 'text-navy-800 hover:bg-navy-900/5',
                    )}
                  >
                    <ArrowUpRight className="size-4" aria-hidden />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        <div className={cn(heroEnter, 'slide-in-from-bottom-4 mt-7 delay-400')}>{actions}</div>
      </div>

      <div
        className={cn(
          heroEnter,
          'zoom-in-95 flex min-w-0 flex-[1_1_420px] flex-col items-center gap-5 delay-300 duration-1000',
        )}
      >
        {current ? (
          <>
            <div className="relative aspect-square w-[min(100%,clamp(280px,60svh,560px))]">
              <div
                aria-hidden
                className="absolute inset-x-[20%] -bottom-[1%] h-[6%] rounded-[50%] bg-[radial-gradient(ellipse,rgb(11_22_51/0.24),rgb(11_22_51/0)_70%)]"
              />
              {slides.map((slide, i) => (
                <Link
                  key={i}
                  href={{ pathname: '/products/[slug]', params: { slug: slide.productSlug } }}
                  aria-hidden={i !== active}
                  tabIndex={i === active ? undefined : -1}
                  className="group absolute inset-0 rounded-3xl outline-brand-500 focus-visible:outline-2"
                  style={{
                    opacity: i === active ? 1 : 0,
                    transform: `translateX(${offset(i, active, 48)}) scale(${i === active ? 1 : 0.92})`,
                    transition: `opacity 600ms ease, transform 900ms ${EASE_OUT}`,
                    pointerEvents: i === active ? 'auto' : 'none',
                  }}
                >
                  <Image
                    src={slide.imageUrl}
                    alt={slide.productTitle}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 1024px) 90vw, 560px"
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </Link>
              ))}
            </div>
            <p className="flex max-w-md items-baseline gap-3 text-xs text-navy-800">
              <span className="font-display shrink-0 font-semibold text-brand-600">
                {pad(active + 1)} / {pad(slides.length)}
              </span>
              <Link
                href={{ pathname: '/products/[slug]', params: { slug: current.productSlug } }}
                className="tracking-[0.14em] uppercase transition-colors hover:text-brand-700"
              >
                {[current.brand, current.productTitle].filter(Boolean).join(' · ')}
              </Link>
            </p>
          </>
        ) : (
          fallbackVisual
        )}
      </div>
    </div>
  )
}
