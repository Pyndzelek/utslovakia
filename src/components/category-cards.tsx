import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, ChevronRight } from 'lucide-react'

function CheckOutBadge() {
  return (
    <span className="absolute bottom-0 right-0 flex items-center gap-1 rounded-tl-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">
      Check out
      <ArrowUpRight className="size-3.5" />
    </span>
  )
}

export function CategoryCards() {
  return (
    <section aria-label="Product categories" className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-5">
          {/* Coin acceptors */}
          <Link
            href="#"
            className="group relative flex min-h-56 overflow-hidden rounded-lg bg-secondary p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-xl font-bold text-foreground">Coin acceptors</h3>
            <div className="absolute bottom-2 right-10 h-40 w-40">
              <Image src="/maszynka.png" alt="" fill className="object-contain" sizes="160px" />
            </div>
            <CheckOutBadge />
          </Link>

          {/* Monitors */}
          <Link
            href="#"
            className="group relative flex min-h-56 overflow-hidden rounded-lg bg-primary p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-xl font-bold text-primary-foreground">Monitors</h3>
            <div className="absolute bottom-0 right-6 h-44 w-56">
              <Image
                src="/maszynka.png"
                alt=""
                fill
                className="object-contain object-bottom"
                sizes="224px"
              />
            </div>
            <span className="absolute bottom-0 right-0 flex items-center gap-1 rounded-tl-lg bg-navy px-4 py-2 text-xs font-medium text-primary-foreground">
              Check out
              <ArrowUpRight className="size-3.5" />
            </span>
          </Link>
        </div>

        {/* Bill acceptors */}
        <Link
          href="#"
          className="group relative flex min-h-56 overflow-hidden rounded-lg bg-navy p-6 transition-shadow hover:shadow-md md:min-h-full"
        >
          <h3 className="text-xl font-bold text-primary-foreground">Bill acceptors</h3>
          <div className="absolute inset-x-8 bottom-4 top-20">
            <Image
              src="/maszynka.png"
              alt=""
              fill
              className="object-contain mix-blend-lighten"
              sizes="(max-width: 768px) 100vw, 480px"
            />
          </div>
          <CheckOutBadge />
        </Link>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="#"
          className="flex items-center gap-1 rounded-md border border-primary px-4 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-accent"
        >
          Check all categories
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </section>
  )
}
