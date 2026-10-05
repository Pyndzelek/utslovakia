import { Label, Textarea } from 'utslovakia'

export const Default = () => (
  <div style={{ maxWidth: 420, padding: 16 }}>
    <Label htmlFor="msg">Wiadomość</Label>
    <Textarea id="msg" placeholder="Opisz, czego szukasz…" />
  </div>
)

export const Filled = () => (
  <div style={{ maxWidth: 420, padding: 16 }}>
    <Label htmlFor="msg2">Wiadomość</Label>
    <Textarea id="msg2" defaultValue="Dzień dobry, proszę o wycenę 20 sztuk urządzenia z katalogu." />
  </div>
)
