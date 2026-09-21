import React from 'react'
import { Container } from '@/components/ui/container'
import { Skeleton } from '@/components/ui/skeleton'

export default function CategoryIndexLoading() {
  return (
    <>
      <div className="border-b border-line bg-white">
        <Container className="py-8 lg:py-10">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-5 h-9 w-64" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        </Container>
      </div>

      <Container className="py-10 lg:py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-3xl" />
          ))}
        </div>
      </Container>
    </>
  )
}
