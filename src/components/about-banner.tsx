import Image from 'next/image'
import Link from 'next/link'

export function AboutBanner() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="grid overflow-hidden rounded-lg bg-secondary md:grid-cols-2">
        <div className="flex flex-col justify-center p-8">
          <h2 className="text-2xl font-normal text-foreground text-balance">
            Lorem ipsum dolor
          </h2>
          <p className="mt-3 max-w-md text-xs leading-relaxed text-muted-foreground">
            Lorem ipsum dolor sit amet consectetur. Quam id tristique tristique
            facilisis sem sed vitae. Id sit at curabitur quis mi bibendum
            ultrices. Sit ac justo vel quam nunc.
          </p>
          <Link
            href="#"
            className="mt-5 w-fit rounded-md border border-foreground/30 px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            Read more about us
          </Link>
        </div>
        <div className="relative min-h-48">
          <Image
            src="/images/about-payment.png"
            alt="Customer using a payment terminal"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 560px"
          />
        </div>
      </div>
    </section>
  )
}
