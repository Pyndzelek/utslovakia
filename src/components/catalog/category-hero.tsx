import React from 'react'
import Image from 'next/image'
import { Container } from '@/components/ui/container'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import type { Category } from '@/lib/mock-data'

interface CategoryHeroProps {
  category: Category
}

export function CategoryHero({ category }: CategoryHeroProps) {
  return (
    <div className="relative overflow-hidden bg-navy-950">
      <div className="pattern-chevron-dark absolute inset-0" aria-hidden />
      <div
        className="absolute top-0 right-0 size-96 translate-x-1/3 -translate-y-1/3 rounded-full bg-brand-600/25 blur-3xl"
        aria-hidden
      />
      <Container className="relative grid items-center gap-8 py-12 lg:grid-cols-[1fr_300px] lg:py-16">
        <div>
          <Breadcrumbs
            items={[{ label: 'Categories', href: '/category' }, { label: category.name }]}
            className="[&_a]:text-slate-400 [&_a:hover]:text-white [&_span]:text-white"
          />
          <h1 className="font-display mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {category.name}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-300">
            {category.description}
          </p>
        </div>
        <div className="relative hidden h-52 lg:block">
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="300px"
            className="object-contain drop-shadow-[0_24px_32px_rgba(0,0,0,0.5)]"
          />
        </div>
      </Container>
    </div>
  )
}
