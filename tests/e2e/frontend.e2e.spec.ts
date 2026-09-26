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

  test('clicking the product image opens an enlarged preview', async ({ page }) => {
    await page.goto('/en/products')
    // The listing streams in after the loading skeleton; its search box arrives with the grid.
    await page.getByRole('main').getByRole('searchbox').waitFor()
    // A card with an image means the product page has a gallery to open.
    const productWithImage = page
      .locator('main article', { has: page.locator('img') })
      .locator('a[href^="/en/products/"]')
      .first()
    test.skip((await productWithImage.count()) === 0, 'no published products with images')

    await productWithImage.click()
    await page.getByRole('button', { name: 'Enlarge image' }).click()
    const preview = page.getByRole('dialog')
    await expect(preview).toBeVisible()
    await expect(preview.locator('img')).toBeVisible()

    // With several images, arrow keys browse them — also once focus has moved into the
    // dialog, whose popup stops arrow keys from bubbling.
    const counter = preview.getByText(/^\d+ \/ \d+$/)
    if ((await counter.count()) > 0) {
      await expect(page.getByRole('button', { name: 'Close preview' })).toBeFocused()
      await page.keyboard.press('ArrowRight')
      await expect(counter).toHaveText(/^2 \//)
    }

    await page.keyboard.press('Escape')
    await expect(preview).toBeHidden()
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
