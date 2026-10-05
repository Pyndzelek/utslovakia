import { Badge } from 'utslovakia'

export const Variants = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: 16 }}>
    <Badge>Nowość</Badge>
    <Badge variant="navy">Bestseller</Badge>
    <Badge variant="sale">Promocja</Badge>
    <Badge variant="success">Dostępny</Badge>
    <Badge variant="warning">Ostatnie sztuki</Badge>
    <Badge variant="muted">Na zamówienie</Badge>
  </div>
)

export const OnDark = () => (
  <div className="bg-navy-900 p-6">
    <Badge variant="on-dark">Autoryzowany dystrybutor</Badge>
  </div>
)
