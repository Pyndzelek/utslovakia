import React from 'react'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
  /** Slot rendered on the right side (e.g. a "view all" link) */
  action?: React.ReactNode
  align?: 'left' | 'center'
  onDark?: boolean
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  onDark = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-end justify-between gap-x-8 gap-y-4',
        align === 'center' && 'flex-col items-center text-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <p
            className={cn(
              'mb-2 text-xs font-semibold tracking-[0.18em] uppercase',
              onDark ? 'text-brand-300' : 'text-brand-600',
            )}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            'font-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl',
            onDark ? 'text-white' : 'text-navy-900',
          )}
        >
          {title}
        </h2>
        {description && (
          <p className={cn('mt-3 text-[15px] leading-relaxed', onDark ? 'text-slate-300' : 'text-slate-500')}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
