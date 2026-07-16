import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  imageClassName?: string
}

export function Logo({ className, imageClassName }: LogoProps) {
  return (
    <Link href="/" className={cn('block h-fit shrink-0', className)}>
      <Image
        src="/uts_logo.png"
        alt="UTS Slovakia"
        width={863}
        height={289}
        priority
        className={cn('block h-auto w-full rounded-xl', imageClassName)}
      />
    </Link>
  )
}
