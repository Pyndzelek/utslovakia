import React from 'react'
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-lg bg-slate-200/70', className)} {...props} />
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="mt-4 space-y-2.5">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    </div>
  )
}
