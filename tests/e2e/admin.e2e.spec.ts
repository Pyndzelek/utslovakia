import { test, expect, type Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test.describe('Admin panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()
    page = await browser.newPage()
    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('shows the catalogue groups on the dashboard', async () => {
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: 'Katalog' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Treści' })).toBeVisible()
  })

  test('opens the product list and the new product form', async () => {
    await page.goto('/admin/collections/products')
    await expect(page.locator('h1', { hasText: 'Produkty' }).first()).toBeVisible()

    await page.goto('/admin/collections/products/create')
    await expect(page.locator('input[name="title"]')).toBeVisible()
  })

  test('opens the site settings', async () => {
    await page.goto('/admin/globals/site-settings')
    await expect(page.locator('h1', { hasText: 'Dane firmy i kontakt' })).toBeVisible()
  })
})
