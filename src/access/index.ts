import type { Access, FieldAccess, Where } from 'payload'

/** Any logged-in admin-panel user (admin or editor). */
export const authenticated: Access = ({ req }) => Boolean(req.user)

export const isAdmin: Access = ({ req }) => req.user?.role === 'admin'

export const isAdminField: FieldAccess = ({ req }) => req.user?.role === 'admin'

/** Admins can touch any user; everyone else only their own account. */
export const isAdminOrSelf: Access = ({ req }) => {
  if (!req.user) return false
  if (req.user.role === 'admin') return true
  return { id: { equals: req.user.id } }
}

/**
 * Public read restricted to documents whose `status` equals `publicValue`;
 * logged-in users see everything (drafts, hidden, archived) in the admin panel.
 */
export const publicWhenStatus =
  (publicValue: string): Access =>
  ({ req }) =>
    req.user ? true : ({ status: { equals: publicValue } } satisfies Where)
