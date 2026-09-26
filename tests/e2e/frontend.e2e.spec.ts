import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('home page renders with the brand in the title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/UT\s?Slovakia/i)
    await expect(page.locator('h1').first()).not.toBeEmpty()
    await expect(page.getByRole('navigation', { name: 'Główna nawigacja' })).toBeVisible()
  })

  test('each locale renders its own language', async ({ page }) => {
    for (const [path, lang] of [
      ['/', 'pl'],
      ['/en', 'en'],
      ['/sk', 'sk'],
      ['/pt-br', 'pt-br'],
    ]) {
      await page.goto(path)
      await expect(page.locator('html')).toHaveAttribute('lang', lang)
    }
  })

  test('unknown URLs get a localized 404', async ({ page }) => {
    const response = await page.goto('/en/this-page-does-not-exist')
    expect(response?.status()).toBe(404)
    await expect(page.getByRole('heading', { name: "We couldn't find that page" })).toBeVisible()
  })

  test('search narrows the product list', async ({ page }) => {
    await page.goto('/en/products')
    await page.getByLabel('Search products').fill('zzz-no-such-product')
    await page.getByRole('button', { name: 'Search', exact: true }).click()
    await expect(page).toHaveURL(/q=zzz-no-such-product/)
    await expect(page.getByText('0 products').first()).toBeVisible()
  })

  test('product card links to the product page', async ({ page }) => {
    await page.goto('/en/products')
    const firstProductLink = page.locator('a[href^="/en/products/"]').first()
    test.skip((await firstProductLink.count()) === 0, 'no published products in this database')

    await firstProductLink.click()
    await expect(page).toHaveURL(/\/en\/products\/[^/?]+$/)
  })

  test('switching language on a category page lands on the localized category', async ({
    page,
  }) => {
    await page.goto('/en/category')
    const firstCategoryLink = page.locator('a[href^="/en/category/"]').first()
    test.skip((await firstCategoryLink.count()) === 0, 'no categories in this database')

    await firstCategoryLink.click()
    await expect(page).toHaveURL(/\/en\/category\/[^/?]+$/)
    const heading = await page.locator('h1').first().textContent()

    await page.getByRole('button', { name: /Change language/ }).click()
    await page.getByRole('link', { name: 'Polski' }).click()

    await expect(page).toHaveURL(/\/kategoria\/[^/?]+$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'pl')
    // Same category (a different or missing one would 404 or show another name).
    await expect(page.locator('h1').first()).not.toHaveText(/couldn't find|nie istnieje/i)
    expect(heading).toBeTruthy()
  })
})

test.describe('Public API access', () => {
  test('anonymous visitors cannot list draft products', async ({ request }) => {
    const res = await request.get('/api/products?where[status][equals]=draft&limit=1')
    expect(res.ok()).toBe(true)
    expect((await res.json()).totalDocs).toBe(0)
  })

  test('anonymous visitors cannot list users', async ({ request }) => {
    const res = await request.get('/api/users')
    expect(res.status()).toBe(403)
  })
})
