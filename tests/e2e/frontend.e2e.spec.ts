import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/UT\s?Slovakia/i)

    const heading = page.locator('h1').first()

    await expect(heading).toBeVisible()
    await expect(heading).not.toBeEmpty()
  })

  test('renders main navigation', async ({ page }) => {
    await page.goto('http://localhost:3000')

    const nav = page.locator('nav[aria-label="Main"]')
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link')).not.toHaveCount(0)
  })

  test('product card links to product detail page', async ({ page }) => {
    // English locale keeps the '/products' path (pl, the default locale,
    // localizes it to '/produkty' — see src/i18n/routing.ts `pathnames`).
    await page.goto('http://localhost:3000/en/products')

    const firstProductLink = page.locator('a[href^="/en/products/"]').first()
    await expect(firstProductLink).toBeVisible()
    await firstProductLink.click()

    await expect(page).toHaveURL(/\/en\/products\/[^/]+$/, { timeout: 15000 })
  })
})
