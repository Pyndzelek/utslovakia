import { Link } from '@/i18n/navigation'
import { Category } from '@/payload-types'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

interface CategoryCardProps {
  category: Category
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const productCount = 0 // TODO: get product count from API
  const image = '/maszynka.png' // TODO: get image from API
  return (
    <Link
      key={category.slug}
      href={{ pathname: '/category/[slug]', params: { slug: category.slug } }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400">{productCount} products</p>
          <h2 className="font-display mt-1.5 text-xl font-semibold tracking-tight text-navy-900 transition-colors group-hover:text-brand-700">
            {category.name}
          </h2>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-navy-900 transition-all group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">
          <ArrowRight className="size-4" aria-hidden />
        </span>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-500">
        {category.description}
      </p>

      <div className="relative mt-6 h-40 rounded-2xl bg-linear-to-br from-slate-50 to-slate-100">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 640px) 90vw, 380px"
          className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    </Link>
  )
}
