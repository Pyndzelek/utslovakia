import React from 'react'
import { Container } from '@/components/ui/container'
import { ProductCardSkeleton, Skeleton } from '@/components/ui/skeleton'

export default function ProductsLoading() {
  return (
    <>
      <div className="border-b border-line bg-white">
        <Container className="py-8 lg:py-10">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-5 h-9 w-64" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        </Container>
      </div>

      <Container className="py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <Skeleton className="hidden h-[560px] self-start rounded-2xl lg:block" />
          <div>
            <Skeleton className="h-[68px] rounded-2xl" />
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}
