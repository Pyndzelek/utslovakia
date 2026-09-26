export const OG_IMAGE_SIZE = { width: 1200, height: 630 }
export const OG_IMAGE_CONTENT_TYPE = 'image/png'

/** Shared brand-styled OG image layout, reused by every `opengraph-image.tsx` route. */
export function BrandOgImage({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        backgroundColor: '#080e21',
        backgroundImage: 'radial-gradient(circle at 85% 20%, rgba(63,112,242,0.35), transparent 55%)',
        color: 'white',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 16,
            backgroundColor: '#2953e6',
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          UT
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 26, fontWeight: 700 }}>UT Slovakia</span>
          <span style={{ fontSize: 16, color: '#94a3b8', letterSpacing: 2, textTransform: 'uppercase' }}>
            Payment systems
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <span style={{ fontSize: 22, color: '#98bdfc', letterSpacing: 3, textTransform: 'uppercase' }}>
          {eyebrow}
        </span>
        <span style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>{title}</span>
      </div>
    </div>
  )
}
