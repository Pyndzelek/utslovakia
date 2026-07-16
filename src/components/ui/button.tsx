import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-medium whitespace-nowrap transition-all duration-200 outline-brand-500 outline-offset-2 focus-visible:outline-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800',
        dark: 'bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950',
        outline:
          'border border-line bg-white text-navy-900 hover:border-brand-400 hover:text-brand-700',
        ghost: 'text-navy-800 hover:bg-navy-900/5',
        inverse: 'bg-white text-navy-900 hover:bg-brand-50',
        'outline-inverse': 'border border-white/25 text-white hover:border-white/60 hover:bg-white/10',
      },
      size: {
        sm: 'h-9 rounded-full px-4 text-sm',
        md: 'h-11 rounded-full px-6 text-sm',
        lg: 'h-12 rounded-full px-7 text-[15px]',
        icon: 'size-11 rounded-full',
        'icon-sm': 'size-9 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
