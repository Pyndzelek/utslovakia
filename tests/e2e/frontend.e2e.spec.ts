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

test.describe('Catalogue browsing', () => {
  test('sorting by price updates the URL and orders the cards', async ({ page }) => {
    await page.goto('/en/products')
    const sort = page.getByRole('main').getByLabel('Sort by')
    await sort.selectOption('price')
    await expect(page).toHaveURL(/[?&]sort=price(&|$)/)
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(0)

    // Cards without a price ("Price on request") are skipped; the rest must not decrease.
    const amounts = (await page.locator('main article').allInnerTexts())
      .map((text) => text.match(/\$([\d,]+\.\d{2})/)?.[1])
      .filter((amount): amount is string => Boolean(amount))
      .map((amount) => Number(amount.replace(/,/g, '')))
    expect(amounts).toEqual([...amounts].sort((a, b) => a - b))
  })

  test('a brand filter shows a removable chip', async ({ page }) => {
    await page.goto('/en/products')
    const brandBoxes = page.locator('aside').first().locator('details', { hasText: 'Brand' })
    test.skip((await brandBoxes.count()) === 0, 'no brands with published products')

    const checkbox = brandBoxes.getByRole('checkbox').first()
    const brandName = (
      await checkbox.locator('xpath=following-sibling::span[1]').innerText()
    ).trim()
    await checkbox.check()
    await expect(page).toHaveURL(/[?&]brand=\d+/)

    const chips = page.getByRole('list', { name: 'Active filters' })
    const chip = chips.getByRole('link', { name: `Remove filter: ${brandName}` })
    await expect(chip).toBeVisible()
    // The page is kept out of search indexes while filtered.
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)

    await chip.click()
    await expect(page).not.toHaveURL(/brand=/)
    await expect(chips).toHaveCount(0)
  })

  test('two quick filter changes are both kept', async ({ page }) => {
    await page.goto('/en/products')
    const sidebar = page.locator('aside').first()
    // Hold the first change's response back, so the second one lands while it is loading.
    await page.route(/stock=in_stock/, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await route.continue()
    })
    await sidebar.getByLabel('In stock only').check()
    await sidebar.getByLabel('Bestseller').check()

    await expect(page).toHaveURL(/stock=in_stock/)
    await expect(page).toHaveURL(/badge=bestseller/)
  })

  test('the first Tab reaches a skip link that moves focus to the content', async ({ page }) => {
    await page.goto('/en/products')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to main content' })
    await expect(skip).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('#main-content')).toBeFocused()
  })
})

test.describe('Inquiry form', () => {
  test('reports missing fields without submitting', async ({ page }) => {
    await page.goto('/en/contact')
    const form = page.locator('#inquiry form')
    await form.getByRole('button', { name: 'Send inquiry' }).click()

    await expect(form.getByText('This field is required.')).toHaveCount(3)
    await expect(form.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'true')
    await expect(form.getByLabel('Full name')).toBeFocused()
  })

  test('still validates right after switching the language', async ({ page }) => {
    await page.goto('/kontakt')
    await page
      .getByRole('banner')
      .getByRole('button', { name: /Zmień język/ })
      .click()
    await page.getByRole('link', { name: 'English' }).first().click()
    await expect(page).toHaveURL(/\/en\/contact/)
    const form = page.locator('#inquiry form')
    await form.getByRole('button', { name: 'Send inquiry' }).click()

    await expect(form.getByText('This field is required.')).toHaveCount(3)
    await expect(page.getByText('your inquiry has been sent')).toHaveCount(0)
  })

  test("a product's quote button attaches the product to the form", async ({ page }) => {
    await page.goto('/en/products')
    await page.waitForLoadState('networkidle')
    const firstProductLink = page.locator('main article a[href^="/en/products/"]').first()
    test.skip((await firstProductLink.count()) === 0, 'no published products in this database')

    await firstProductLink.click()
    await expect(page).toHaveURL(/\/en\/products\/[^/?]+$/)
    const title = (await page.locator('main h1').innerText()).trim()
    await page.getByRole('main').getByRole('link', { name: 'Ask for a quote' }).first().click()

    await expect(page).toHaveURL(/\/en\/contact\?product=/)
    const attached = page.locator('#inquiry').getByText('Inquiry about')
    await expect(attached).toBeVisible()
    await expect(page.locator('#inquiry').getByText(title, { exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Remove product from the inquiry' }).click()
    await expect(attached).toBeHidden()
  })
})

test.describe('Public API access', () => {
  test('anonymous visitors cannot list draft products', async ({ request }) => {
    const res = await request.get('/api/products?where[status][equals]=draft&limit=1')
    expect(res.ok()).toBe(true)
    expect((await res.json()).totalDocs).toBe(0)
  })

  test('anonymous visitors can neither read nor create inquiries', async ({ request }) => {
    expect((await request.get('/api/inquiries')).status()).toBe(403)
    const created = await request.post('/api/inquiries', {
      data: { name: 'Bot', email: 'bot@example.com', message: 'Spam spam spam' },
    })
    expect(created.status()).toBe(403)
  })

  test('anonymous visitors cannot list users', async ({ request }) => {
    const res = await request.get('/api/users')
    expect(res.status()).toBe(403)
  })
})
