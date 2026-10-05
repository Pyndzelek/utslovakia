// Design-sync stub: the locale-aware Link becomes a plain anchor.
import React from 'react'

type Href = string | { pathname: string; params?: Record<string, string> }

export function Link({ href, ...props }: Omit<React.ComponentProps<'a'>, 'href'> & { href: Href }) {
  return <a href={typeof href === 'string' ? href : href.pathname} {...props} />
}
