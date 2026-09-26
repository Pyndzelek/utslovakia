import React from 'react'

const tips: { title: string; text: string; href?: string; linkLabel?: string }[] = [
  {
    title: 'Dodawanie produktu',
    text: 'Produkty → „Utwórz nowy”. Wpisz nazwę, wybierz kategorię, dodaj zdjęcia i cenę w PLN (pozostałe waluty są opcjonalne). Status „Opublikowany” pokazuje produkt na stronie.',
    href: '/admin/collections/products/create',
    linkLabel: 'Dodaj produkt',
  },
  {
    title: 'Tłumaczenia',
    text: 'Przełącznik języka u góry formularza zmienia wersję językową. Puste pola w innym języku pokazują treść polską.',
  },
  {
    title: 'Zdjęcia',
    text: 'Maksymalnie 4 MB na plik. Zawsze uzupełnij „Opis zdjęcia (alt)” — czyta go Google i czytniki ekranu.',
    href: '/admin/collections/media',
    linkLabel: 'Biblioteka mediów',
  },
  {
    title: 'Dane firmy i kontakt',
    text: 'Telefony, e-maile, adres, godziny otwarcia i FAQ widoczne w stopce i na stronie Kontakt.',
    href: '/admin/globals/site-settings',
    linkLabel: 'Edytuj dane firmy',
  },
  {
    title: 'Cofanie zmian',
    text: 'Każdy produkt, kategoria i dane firmy mają zakładkę „Wersje” — można tam przywrócić wcześniejszy zapis.',
  },
]

/** Short Polish how-to shown above the admin dashboard (admin.components.beforeDashboard). */
export function DashboardHelp() {
  return (
    <section
      style={{
        marginBottom: 'calc(var(--base) * 2)',
        padding: 'calc(var(--base) * 1.25)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 'var(--style-radius-m)',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <h2 style={{ margin: 0, marginBottom: 'calc(var(--base) * 0.75)' }}>Jak korzystać z panelu</h2>
      <div
        style={{
          display: 'grid',
          gap: 'var(--base)',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        }}
      >
        {tips.map((tip) => (
          <div key={tip.title}>
            <h4 style={{ margin: 0, marginBottom: 'calc(var(--base) * 0.25)' }}>{tip.title}</h4>
            <p style={{ margin: 0, color: 'var(--theme-elevation-800)', lineHeight: 1.5 }}>
              {tip.text}
            </p>
            {tip.href && (
              <a href={tip.href} style={{ display: 'inline-block', marginTop: 6 }}>
                {tip.linkLabel} →
              </a>
            )}
          </div>
        ))}
      </div>
      <p style={{ margin: 0, marginTop: 'var(--base)', color: 'var(--theme-elevation-600)' }}>
        Zmiany są widoczne na stronie od razu po zapisaniu. Pełna instrukcja: docs/instrukcja-admin.md
      </p>
    </section>
  )
}
