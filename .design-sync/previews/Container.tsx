import { Container } from 'utslovakia'

export const Default = () => (
  <div className="bg-canvas py-8">
    <Container>
      <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <h3 className="font-display text-xl font-semibold text-navy-900">Zawartość strony</h3>
        <p className="mt-2 text-slate-600">
          Container centruje treść, ogranicza jej szerokość do 7xl i dodaje responsywne marginesy.
        </p>
      </div>
    </Container>
  </div>
)
