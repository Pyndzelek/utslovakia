import Link from 'next/link'

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

const categoryLinks = ['Link Two', 'Link Three', 'Link Four', 'Link Five']
const pageLinks = ['Link Seven', 'Link Eight', 'Link Nine', 'Link Ten']

export function SiteFooter() {
  return (
    <footer className="bg-navy text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 md:flex-row md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="size-6 fill-primary-foreground"
              aria-hidden="true"
            >
              <path d="M4 5l8 6 8-6v4l-8 6-8-6V5z" />
            </svg>
            <p className="text-lg">
              <span className="font-bold">UT</span>
              <span className="font-light italic">Slovakia</span>
            </p>
          </div>
          <div className="mt-6 space-y-1 text-xs text-primary-foreground/80">
            <p className="font-medium text-primary-foreground">Contact:</p>
            <p>utsslovakia@gmail.com</p>
            <p>+421 914 154 546</p>
            <p>+421 911 415 452</p>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <Link
              href="#"
              aria-label="Facebook"
              className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
            >
              <FacebookIcon className="size-4" />
            </Link>
            <Link
              href="#"
              aria-label="Instagram"
              className="text-primary-foreground/80 transition-colors hover:text-primary-foreground"
            >
              <InstagramIcon className="size-4" />
            </Link>
          </div>
        </div>

        <nav aria-label="Footer" className="flex gap-16">
          <div>
            <p className="text-xs font-semibold">Category</p>
            <ul className="mt-4 space-y-3">
              {categoryLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-xs text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold">Pages</p>
            <ul className="mt-4 space-y-3">
              {pageLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-xs text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <p className="text-[10px] text-primary-foreground/50">
            © {new Date().getFullYear()} UTSlovakia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
