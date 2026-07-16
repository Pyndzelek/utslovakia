import React from 'react'
import { CarFront, Dice5, Gamepad2, Store, Trophy, WashingMachine, type LucideIcon } from 'lucide-react'
import { industries } from '@/lib/mock-data'

const industryIcons: Record<string, LucideIcon> = {
  'sport-betting': Trophy,
  amusement: Gamepad2,
  gaming: Dice5,
  vending: Store,
  laundry: WashingMachine,
  transport: CarFront,
}

export function Industries() {
  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-5">
      {industries.map((industry) => {
        const Icon = industryIcons[industry.slug] ?? Store
        return (
          <li
            key={industry.slug}
            className="group rounded-2xl border border-line bg-white p-5 text-center shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
          >
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
              <Icon className="size-5" aria-hidden />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-navy-900">{industry.name}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{industry.description}</p>
          </li>
        )
      })}
    </ul>
  )
}
