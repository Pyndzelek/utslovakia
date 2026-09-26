'use client'

import { useEffect } from 'react'
import { Container } from '@/components/ui/container'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

export default function FrontendError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Container className="flex flex-col items-center py-24 text-center">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-900">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-slate-500">
        An unexpected error occurred while loading this page. You can try again, or head back to the
        homepage.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => reset()}
          className={buttonVariants({ variant: 'primary', size: 'md' })}
        >
          Try again
        </button>
        <Link href="/" className={buttonVariants({ variant: 'outline', size: 'md' })}>
          Back to homepage
        </Link>
      </div>
    </Container>
  )
}
