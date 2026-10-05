import { Button } from 'utslovakia'

export const Variants = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 16 }}>
    <Button>Zapytaj o ofertę</Button>
    <Button variant="dark">Pobierz katalog</Button>
    <Button variant="outline">Zobacz produkty</Button>
    <Button variant="ghost">Dowiedz się więcej</Button>
  </div>
)

export const OnDark = () => (
  <div className="flex flex-wrap gap-3 bg-navy-900 p-6">
    <Button variant="inverse">Skontaktuj się</Button>
    <Button variant="outline-inverse">Zobacz ofertę</Button>
  </div>
)

export const Sizes = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, padding: 16 }}>
    <Button size="sm">Mały</Button>
    <Button size="md">Średni</Button>
    <Button size="lg">Duży</Button>
  </div>
)

export const Disabled = () => (
  <div style={{ padding: 16 }}>
    <Button disabled>Niedostępne</Button>
  </div>
)
