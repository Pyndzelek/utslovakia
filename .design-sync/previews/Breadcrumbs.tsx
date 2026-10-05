import { Breadcrumbs } from 'utslovakia'

export const Trail = () => (
  <div style={{ padding: 16 }}>
    <Breadcrumbs
      items={[
        { label: 'Produkty', href: '/products' },
        { label: 'Systemy chłodzenia', href: '/category/cooling' },
        { label: 'Agregat chłodniczy AX-200' },
      ]}
    />
  </div>
)

export const Short = () => (
  <div style={{ padding: 16 }}>
    <Breadcrumbs items={[{ label: 'Kontakt' }]} />
  </div>
)
