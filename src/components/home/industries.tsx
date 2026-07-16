import React from 'react'
import { getTranslations } from 'next-intl/server'
import { CarFront, Gamepad2, Store, WashingMachine, type LucideIcon } from 'lucide-react'
import { industries, type Industry } from '@/lib/mock-data'

const industryIcons: Record<Industry['slug'], LucideIcon> = {
  amusement: Gamepad2,
  vending: Store,
  laundry: WashingMachine,
  transport: CarFront,
}

export async function Industries() {
  const t = await getTranslations('home.industries.items')

  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-4  lg:gap-5">
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
            <h3 className="mt-4 text-sm font-semibold text-navy-900">
              {t(`${industry.slug}.name`)}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              {t(`${industry.slug}.description`)}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
