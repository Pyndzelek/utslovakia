'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('errorPage')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Container className="flex flex-col items-center py-24 text-center">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-900">
        {t('title')}
      </h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-slate-500">{t('description')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => reset()}
          className={buttonVariants({ variant: 'primary', size: 'md' })}
        >
          {t('retry')}
        </button>
        <Link href="/" className={buttonVariants({ variant: 'outline', size: 'md' })}>
          {t('backHome')}
        </Link>
      </div>
    </Container>
  )
}
