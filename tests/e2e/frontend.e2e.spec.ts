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
    // The mobile menu has its own "Search products" field; use the catalogue's.
    await page.getByRole('main').getByLabel('Search products').fill('zzz-no-such-product')
    await page.getByRole('button', { name: 'Search', exact: true }).click()
    await expect(page).toHaveURL(/q=zzz-no-such-product/)
    await expect(page.getByText('0 products').first()).toBeVisible()
  })

  test('search matches other languages and ignores diacritics', async ({ page }) => {
    await page.goto('/en/products')
    const firstCard = page.getByRole('main').locator('article').first()
    await page.getByRole('main').getByRole('searchbox').waitFor()
    test.skip((await firstCard.count()) === 0, 'no published products in this database')

    // Product slugs aren't localized, so the same product is /produkty/<slug> on the Polish site.
    const href = await firstCard.locator('a[href^="/en/products/"]').first().getAttribute('href')
    const polishLink = `a[href="${href!.replace('/en/products/', '/produkty/')}"]`
    const englishTitle = (await firstCard.locator('h3').innerText()).trim()

    // Its English title finds it on the Polish site… (dropping the NEXT_LOCALE=en cookie
    // from the visit above, which would otherwise redirect unprefixed Polish URLs to /en)
    await page.context().clearCookies()
    await page.goto(`/produkty?q=${encodeURIComponent(englishTitle)}`)
    const result = page.getByRole('main').locator('article', { has: page.locator(polishLink) })
    await expect(result).toBeVisible()

    // …and so does its Polish title typed without Polish letters.
    const polishTitle = (await result.locator('h3').innerText()).trim()
    const withoutDiacritics = polishTitle
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .replace(/ł/g, 'l')
      .replace(/Ł/g, 'L')
    await page.goto(`/produkty?q=${encodeURIComponent(withoutDiacritics)}`)
    await expect(page.getByRole('main').locator(polishLink).first()).toBeVisible()
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

  test("bestsellers' View all lists only bestsellers", async ({ page }) => {
    await page.goto('/en')
    const bestsellers = page.locator('section', {
      has: page.getByRole('heading', { name: 'Bestsellers' }),
    })
    test.skip(
      (await bestsellers.locator('article').count()) === 0,
      'no bestsellers in this database',
    )
    await bestsellers.getByRole('link', { name: 'View all' }).click()

    await expect(page).toHaveURL(/\/en\/products\?badge=bestseller$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Bestsellers' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Bestseller' }).first()).toBeChecked()

    const cards = page.locator('main article')
    await expect(cards.first()).toBeVisible()
    await expect(cards.filter({ hasText: 'Bestseller' })).toHaveCount(await cards.count())
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
