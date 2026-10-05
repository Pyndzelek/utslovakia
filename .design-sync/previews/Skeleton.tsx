import { Skeleton } from 'utslovakia'

export const Card = () => (
  <div className="w-64 rounded-2xl border border-line bg-white p-4">
    <Skeleton className="aspect-square w-full rounded-xl" />
    <div className="mt-4 space-y-2.5">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-5 w-1/2" />
    </div>
  </div>
)

export const Lines = () => (
  <div className="w-72 space-y-2.5 p-4">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-4 w-2/3" />
  </div>
)
