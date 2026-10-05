import { Label, Select } from 'utslovakia'

export const Default = () => (
  <div style={{ maxWidth: 320, padding: 16 }}>
    <Label htmlFor="cat">Kategoria</Label>
    <Select id="cat" defaultValue="">
      <option value="" disabled>Wybierz kategorię</option>
      <option>Systemy chłodzenia</option>
      <option>Automatyka</option>
      <option>Narzędzia</option>
    </Select>
  </div>
)
