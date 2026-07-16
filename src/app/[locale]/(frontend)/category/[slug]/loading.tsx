import React from 'react'
import { Container } from '@/components/ui/container'
import { ProductCardSkeleton, Skeleton } from '@/components/ui/skeleton'

export default function CategoryLoading() {
  return (
    <>
      <div className="bg-navy-950">
        <Container className="py-12 lg:py-16">
          <Skeleton className="h-4 w-48 bg-white/10" />
          <Skeleton className="mt-6 h-9 w-72 bg-white/10" />
          <Skeleton className="mt-4 h-4 w-full max-w-xl bg-white/10" />
          <Skeleton className="mt-2 h-4 w-2/3 max-w-md bg-white/10" />
        </Container>
      </div>

      <div className="border-b border-line bg-white">
        <Container className="flex gap-2 py-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-32 rounded-full" />
          ))}
        </Container>
      </div>

      <Container className="py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <Skeleton className="hidden h-[560px] self-start rounded-2xl lg:block" />
          <div>
            <Skeleton className="h-[68px] rounded-2xl" />
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}
