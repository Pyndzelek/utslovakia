# UTSlovakia — design conventions

UTSlovakia is a B2B product catalogue (not a shop): clean, cool off-white canvas, deep navy ink, vivid brand blue, fully rounded pill buttons, soft cards. Copy is Polish by default (also English, Slovak, Portuguese).

## Setup
Components are plain React exported on `window.UTSlovakia` — **no provider needed**. Everything is styled by `styles.css` (Tailwind v4 output + tokens); load it and you're done. Fonts: Inter (body, `font-sans`) and Sora (headings/prices, `font-display`), loaded from Google Fonts by `styles.css`. Page background is `bg-canvas`, body text `text-slate-600`.

## Styling idiom: Tailwind utilities + brand tokens
Use the utility classes below for your own layout glue; use library components for controls. Read `styles.css` (and `_ds_bundle.css`) before inventing classes — only utilities present there exist.

| Family | Names |
|---|---|
| Brand blue | `{bg,text,border,ring}-brand-{50…950}` (primary action = `bg-brand-600`, hover `-700`) |
| Navy ink | `{bg,text,border}-navy-{600,700,800,900,950}` (headings `text-navy-900`, dark sections `bg-navy-900`) |
| Surfaces | `bg-canvas` (page), `bg-white` (cards), `border-line` (1px hairline) |
| Elevation | `shadow-card`, `shadow-lift`, `shadow-glow` |
| Type | `font-display` for headings/prices, `font-sans` body; muted text `text-slate-500` |
| Shape | cards `rounded-2xl border border-line bg-white`, controls/pills `rounded-full`, inputs `rounded-xl` |
| Patterns | `pattern-chevron-dark` (on navy), `pattern-chevron-light`, `no-scrollbar` |

CSS variables: `--color-brand-*`, `--color-navy-*`, `--color-canvas`, `--color-line`, `--shadow-card|lift|glow`, `--font-display`, `--font-sans`.

## Components (see `components/general/<Name>/<Name>.prompt.md` and `.d.ts`)
`Button` (variants `primary|dark|outline|ghost|inverse|outline-inverse`; sizes `sm|md|lg|icon|icon-sm`), `Badge` (`brand|navy|sale|success|warning|muted|on-dark`), `Container` (max-w-7xl page gutter), `SectionHeading` (eyebrow/title/description/action, `align`, `onDark`), `Label` `Input` `Textarea` `Select` `Checkbox` (forms), `Price`, `Breadcrumbs`, `Skeleton`, `RevealOnScroll`.
Use `inverse`/`outline-inverse` buttons and `on-dark` badges / `onDark` headings on `bg-navy-900` sections.

## Example
```jsx
const { Container, SectionHeading, Button, Badge } = window.UTSlovakia
<section className="bg-canvas py-16">
  <Container>
    <SectionHeading eyebrow="Katalog" title="Wyróżnione produkty"
      description="Sprawdzone rozwiązania dla przemysłu."
      action={<Button variant="outline" size="sm">Zobacz wszystkie</Button>} />
    <div className="mt-8 grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
        <Badge variant="success">Dostępny</Badge>
        <h3 className="mt-3 font-display text-lg font-semibold text-navy-900">Agregat AX-200</h3>
      </div>
    </div>
  </Container>
</section>
```
