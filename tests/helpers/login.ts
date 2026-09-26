import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface LoginOptions {
  page: Page
  user: {
    email: string
    password: string
  }
}

/** Logs the user into the admin panel via the login page (uses Playwright's `baseURL`). */
export async function login({ page, user }: LoginOptions): Promise<void> {
  await page.goto('/admin/login')

  await page.fill('#field-email', user.email)
  await page.fill('#field-password', user.password)
  await page.click('button[type="submit"]')

  await page.waitForURL(/\/admin$/)
  // The Polish help panel rendered above the dashboard (src/components/admin/dashboard-help.tsx).
  await expect(page.getByRole('heading', { name: 'Jak korzystać z panelu' })).toBeVisible()
}
