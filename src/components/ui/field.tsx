import React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Visual-only form primitives — nothing submits anywhere yet. */

const fieldBase =
  'w-full rounded-xl border border-line bg-white text-sm text-navy-900 placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:outline-2 focus:outline-brand-500/20'

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('mb-1.5 block text-sm font-medium text-navy-900', className)} {...props} />
  )
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, 'h-11 px-4', className)} {...props} />
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, 'min-h-32 px-4 py-3', className)} {...props} />
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn('relative', className)}>
      <select className={cn(fieldBase, 'h-11 appearance-none pr-10 pl-4')} {...props}>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
    </div>
  )
}

export function Checkbox({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        'size-4 shrink-0 cursor-pointer appearance-none rounded border border-slate-300 bg-white transition-colors checked:border-brand-600 checked:bg-brand-600 ]',
        className,
      )}
      {...props}
    />
  )
}
