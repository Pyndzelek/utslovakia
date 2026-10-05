import { Input, Label } from 'utslovakia'

export const WithLabel = () => (
  <div style={{ maxWidth: 360, padding: 16 }}>
    <Label htmlFor="email">Adres e-mail</Label>
    <Input id="email" type="email" placeholder="jan.kowalski@firma.pl" />
  </div>
)

export const Filled = () => (
  <div style={{ maxWidth: 360, padding: 16 }}>
    <Label htmlFor="name">Imię i nazwisko</Label>
    <Input id="name" defaultValue="Jan Kowalski" />
  </div>
)

export const Disabled = () => (
  <div style={{ maxWidth: 360, padding: 16 }}>
    <Label htmlFor="co">Firma</Label>
    <Input id="co" disabled defaultValue="UT Slovakia s.r.o." />
  </div>
)
