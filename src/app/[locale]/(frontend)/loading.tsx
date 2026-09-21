import React from 'react'
import { Container } from '@/components/ui/container'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomeLoading() {
  return (
    <Container className="py-16">
      <Skeleton className="h-64 w-full rounded-3xl" />
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    </Container>
  )
}
