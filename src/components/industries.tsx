import Link from 'next/link'
import { Target, Dices, Gamepad2, WashingMachine } from 'lucide-react'

const industries = [
  { label: 'Sport betting', icon: Target },
  { label: 'Amusment', icon: Dices },
  { label: 'Gaming', icon: Gamepad2 },
  { label: 'Payment and laundry system', icon: WashingMachine },
]

export function Industries() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <h2 className="text-center text-2xl font-bold tracking-tight text-foreground">
        Browse by Industries
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {industries.map(({ label, icon: Icon }) => (
          <Link
            key={label}
            href="#"
            className="flex flex-col items-center justify-center gap-3 rounded-lg bg-secondary px-4 py-8 text-center transition-colors hover:bg-accent"
          >
            <Icon className="size-6 text-foreground" strokeWidth={1.5} />
            <span className="text-xs font-medium text-foreground text-balance">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
