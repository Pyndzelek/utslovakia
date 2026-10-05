import { RevealOnScroll } from 'utslovakia'

export const Staggered = () => (
  <div className="grid gap-3 p-4 sm:grid-cols-3">
    {['Szybka dostawa', 'Gwarancja 24 mies.', 'Wsparcie techniczne'].map((t, i) => (
      <RevealOnScroll key={t} index={i}>
        <div className="rounded-2xl border border-line bg-white p-5 font-medium text-navy-900 shadow-card">
          {t}
        </div>
      </RevealOnScroll>
    ))}
  </div>
)
