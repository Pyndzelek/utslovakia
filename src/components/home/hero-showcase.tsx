'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ArrowUpRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import type { HeroSlide } from '@/lib/data/home-page'

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

  // Keep the active chip in view as autoplay advances (only when the mobile row is rendered).
  const chipsRef = useRef<HTMLUListElement>(null)
  useEffect(() => {
    const row = chipsRef.current
    const chip = row?.children[active] as HTMLElement | undefined
    if (!row || !chip || !row.offsetParent) return
    row.scrollTo({
      left: chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2,
      behavior: 'smooth',
    })
  }, [active])

  const select = (i: number) => {
    setActive(i)
    setCycle((c) => c + 1)
  }

  const current = slides[active]
  const longestWord = Math.max(0, ...slides.map((s) => s.word.length))
  const wordScale = Math.min(1, WORD_FIT_CHARS / Math.max(longestWord, 1))
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    // Mobile: one column ordered badge → word → product → selector → intro → actions, so the
    // product lands right under the word it illustrates. From lg the text column is a real box
    // again and sits beside the stage.
    <div
      className="flex flex-col lg:flex-row lg:items-center lg:gap-14"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false)
      }}
    >
      <div className="contents lg:block lg:max-w-[540px] lg:min-w-0 lg:flex-[1_1_400px]">
        <div className={cn(heroEnter, 'order-1 slide-in-from-bottom-2')}>{badge}</div>

        {slides.length > 0 && (
          <div
            aria-hidden
            className={cn(heroEnter, 'order-2 slide-in-from-bottom-4 mt-4 grid delay-100 sm:mt-6')}
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

        {slides.length > 0 && (
          // Mobile selector: a swipeable chip row directly under the product.
          <ul
            ref={chipsRef}
            aria-label={t('slidesLabel')}
            className={cn(
              heroEnter,
              'no-scrollbar relative order-4 -mx-4 mt-5 flex snap-x gap-2 overflow-x-auto scroll-px-4 px-4 py-0.5 delay-300 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:hidden',
            )}
          >
            {slides.map((slide, i) => {
              const isActive = i === active
              return (
                <li
                  key={i}
                  className={cn(
                    'flex shrink-0 snap-start items-center rounded-full border transition-colors duration-300',
                    isActive
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-navy-900/10 bg-white/70 text-navy-800',
                  )}
                >
                  <button
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => select(i)}
                    className={cn(
                      'font-display flex h-9 cursor-pointer items-center rounded-full pl-3.5 text-sm font-semibold whitespace-nowrap outline-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2',
                      isActive ? 'pr-1' : 'pr-3.5',
                    )}
                  >
                    {slide.category.name}
                  </button>
                  {isActive && (
                    <Link
                      href={{ pathname: '/category/[slug]', params: { slug: slide.category.slug } }}
                      aria-label={t('openCategory', { name: slide.category.name })}
                      className="mr-1 grid size-7 place-items-center rounded-full outline-white hover:bg-white/15 focus-visible:outline-2"
                    >
                      <ArrowUpRight className="size-4" aria-hidden />
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        <div className={cn(heroEnter, 'order-5 mt-6 slide-in-from-bottom-4 delay-200 lg:mt-0')}>
          {intro}
        </div>

        {slides.length > 0 && (
          <ul
            aria-label={t('slidesLabel')}
            className={cn(
              heroEnter,
              'slide-in-from-bottom-4 mt-7 hidden border-t border-navy-900/10 delay-300 lg:block',
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

        <div className={cn(heroEnter, 'order-6 mt-7 slide-in-from-bottom-4 delay-400')}>
          {actions}
        </div>
      </div>

      <div
        className={cn(
          heroEnter,
          // Without slides the fallback image is decoration, so it drops below the actions.
          slides.length ? 'order-3 mt-5' : 'order-7 mt-10',
          'zoom-in-95 flex min-w-0 flex-col items-center delay-300 duration-1000 lg:order-none lg:mt-0 lg:flex-[1_1_420px] lg:items-end',
        )}
      >
        {current ? (
          // Sized to the stage so the caption stays centred under it while the pair hugs the right edge.
          // Smaller on mobile so word + product + selector fit the first screen.
          <div className="flex w-[min(100%,clamp(240px,42svh,420px))] flex-col items-center gap-3 lg:w-[min(100%,clamp(280px,60svh,560px))] lg:gap-5">
            <div className="relative aspect-square w-full">
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
                    sizes="(max-width: 1024px) 80vw, 560px"
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </Link>
              ))}
            </div>
            <p className="flex max-w-md items-baseline gap-3 text-center text-xs text-navy-800">
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
          </div>
        ) : (
          fallbackVisual
        )}
      </div>
    </div>
  )
}
