import Image from 'next/image'

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy">
      {/* Subtle chevron pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(135deg, transparent 45%, var(--navy-light) 45%, var(--navy-light) 55%, transparent 55%), linear-gradient(45deg, transparent 45%, var(--navy-light) 45%, var(--navy-light) 55%, transparent 55%)',
          backgroundSize: '480px 480px',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left -120px top -80px, left -120px top 160px',
        }}
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-12 md:flex-row md:justify-between md:py-16">
        <div className="max-w-md text-center md:text-left">
          <h1 className="text-3xl font-normal text-primary-foreground md:text-4xl text-balance">
            Lorem ipsum dolor <span className="font-bold tracking-tight">Amet</span>
          </h1>
          <p className="mt-4 text-xs leading-relaxed text-primary-foreground/70">
            Lorem ipsum dolor sit amet consectetur. Quam id tristique tristique facilisis sem sed
            vitae. Id sit at curabitur quis mi bibendum ultrices. Sit ac justo vel quam nunc.
          </p>
          <button
            type="button"
            className="mt-6 rounded-md border border-primary-foreground/50 px-4 py-1.5 text-xs text-primary-foreground transition-colors hover:bg-primary-foreground/10"
          >
            Buy now
          </button>
        </div>
        <div className="relative h-64 w-64 md:h-80 md:w-96">
          <Image
            src="/maszynka.png"
            alt="JCM UBA 10 bill acceptor"
            fill
            priority
            className="rounded-lg object-contain mix-blend-lighten"
            sizes="(max-width: 768px) 256px, 384px"
          />
        </div>
      </div>
    </section>
  )
}
