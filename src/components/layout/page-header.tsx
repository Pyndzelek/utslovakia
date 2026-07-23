import { Container } from '../ui/container'
import { BreadcrumbItem, Breadcrumbs } from '../ui/breadcrumbs'

interface PageHeaderProps {
  title: string
  description: string
  breadcrumbs: BreadcrumbItem[]
}

export default function PageHeader({ title, description, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="border-b border-line bg-white">
      <Container className="py-8 lg:py-10">
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] text-slate-500">{description}</p>
      </Container>
    </div>
  )
}
