import React from 'react'
import { Container } from '@/components/ui/container'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductLoading() {
  return (
    <>
      <div className="border-b border-line bg-white">
        <Container className="py-5">
          <Skeleton className="h-4 w-64" />
        </Container>
      </div>

      <Container className="py-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <Skeleton className="aspect-square w-full rounded-2xl" />

          <div>
            <Skeleton className="mt-3 h-9 w-3/4" />
            <Skeleton className="mt-6 h-6 w-32" />
            <Skeleton className="mt-6 h-40 w-full rounded-2xl" />
          </div>
        </div>
      </Container>
    </>
  )
}
