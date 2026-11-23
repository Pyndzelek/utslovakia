'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { RotateCcw, TriangleAlert } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { StatusHero } from '@/components/layout/status-hero'
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
    <StatusHero
      icon={<TriangleAlert className="size-3.5" aria-hidden />}
      eyebrow={t('eyebrow')}
      title={t('title')}
      description={t('description')}
    >
      <button
        type="button"
        onClick={() => reset()}
        className={buttonVariants({ variant: 'inverse', size: 'md' })}
      >
        <RotateCcw aria-hidden />
        {t('retry')}
      </button>
      <Link href="/" className={buttonVariants({ variant: 'outline-inverse', size: 'md' })}>
        {t('backHome')}
      </Link>
    </StatusHero>
  )
}
