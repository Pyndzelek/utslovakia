import { Input, Label } from 'utslovakia'

export const Default = () => (
  <div style={{ maxWidth: 320, padding: 16 }}>
    <Label htmlFor="phone">Numer telefonu</Label>
    <Input id="phone" placeholder="+421 2 5478 9630" />
  </div>
)
