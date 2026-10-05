import { Button, SectionHeading } from 'utslovakia'

export const Default = () => (
  <div style={{ padding: 24 }}>
    <SectionHeading
      eyebrow="Katalog"
      title="Wyróżnione produkty"
      description="Sprawdzone rozwiązania dla przemysłu, wybrane przez naszych inżynierów."
      action={<Button variant="outline" size="sm">Zobacz wszystkie</Button>}
    />
  </div>
)

export const Centered = () => (
  <div style={{ padding: 24 }}>
    <SectionHeading
      align="center"
      eyebrow="Branże"
      title="Obsługujemy wiele sektorów"
      description="Od produkcji po logistykę."
    />
  </div>
)

export const OnDark = () => (
  <div className="bg-navy-900 p-8">
    <SectionHeading onDark eyebrow="Kontakt" title="Porozmawiajmy o Twoim projekcie" description="Odpowiadamy w ciągu jednego dnia roboczego." />
  </div>
)
