import { Checkbox } from 'utslovakia'

export const States = () => (
  <div style={{ display: 'grid', gap: 12, padding: 16 }}>
    {[
      ['Tylko dostępne', true],
      ['Promocje', false],
    ].map(([label, checked]) => (
      <label key={String(label)} className="flex items-center gap-2.5 text-sm text-navy-900">
        <Checkbox defaultChecked={Boolean(checked)} />
        {String(label)}
      </label>
    ))}
  </div>
)
