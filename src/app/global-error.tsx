'use client'

import { useEffect } from 'react'

// Rendered outside the locale layout (no next-intl provider), so the few strings it
// needs are inlined and the language is picked from the URL's locale prefix.
const copy = {
  pl: {
    title: 'Coś poszło nie tak',
    text: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
    retry: 'Spróbuj ponownie',
  },
  en: {
    title: 'Something went wrong',
    text: 'An unexpected error occurred. Please try again.',
    retry: 'Try again',
  },
  sk: {
    title: 'Niečo sa pokazilo',
    text: 'Nastala neočakávaná chyba. Skúste to znova.',
    retry: 'Skúsiť znova',
  },
  'pt-br': {
    title: 'Algo deu errado',
    text: 'Ocorreu um erro inesperado. Tente novamente.',
    retry: 'Tentar novamente',
  },
} as const

type CopyLocale = keyof typeof copy

function localeFromPath(): CopyLocale {
  if (typeof window === 'undefined') return 'pl'
  const segment = window.location.pathname.split('/')[1]
  return segment in copy ? (segment as CopyLocale) : 'pl'
}

// Next.js requires this to render its own <html>/<body> — it replaces the
// entire page (including the locale layout) when an error escapes every
// nested error boundary.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const locale = localeFromPath()
  const t = copy[locale]

  return (
    <html lang={locale}>
      <body>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>{t.title}</h1>
          <p style={{ color: '#64748b', maxWidth: 420 }}>{t.text}</p>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 24px',
              borderRadius: 999,
              backgroundColor: '#2953e6',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {t.retry}
          </button>
        </div>
      </body>
    </html>
  )
}
