import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { originalCategories } from '../../lib/cms/categories'

const seed = JSON.parse(readFileSync('supabase/seed.json', 'utf8'))
// Intercept the browser's HTTP requests and answer with local fixtures. This
// makes UI tests repeatable without touching Supabase or depending on uptime.
// A passing mocked test proves rendering/interaction, not live API permissions.
async function mockDatabase(page: Page, data = seed) {
  await page.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return route.continue()
    if (url.pathname.startsWith('/rest/v1/')) {
      expect(route.request().method()).toBe('GET')
      const table = url.pathname.split('/').pop()!
      if (table === 'categories') return route.fulfill({ json: data.categories ?? originalCategories, headers: { 'access-control-allow-origin': '*' } })
      expect(url.searchParams.get('published')).toBe('eq.true')
      return route.fulfill({ json: data[table], headers: { 'access-control-allow-origin': '*' } })
    }
    return route.abort()
  })
}

test('existing home and LongMarch content are populated from the database', async ({ page }) => {
  await mockDatabase(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Long March', exact: true })).toBeVisible()
  await page.getByRole('link', { name: /Featured Project/ }).click()
  await expect(page).toHaveURL(/LongMarch/)
  await expect(page.getByText('The Long March has been released and is available to play!')).toBeVisible()
  await expect(page.locator('article img')).toHaveCount(3)
  await expect(page.locator('article iframe')).toHaveCount(2)
})

test('all existing categories and modals render imported content', async ({ page }) => {
  await mockDatabase(page)
  for (const [path, category, title, count] of [
    ['/portfolio', 'Modeling', 'PS-22 Tracer', 6],
    ['/portfolio', 'Animations', "Dead Man's Tale", 2],
    ['/design', 'Unreal Engine 5', 'Parkour FPS Prototype', 1],
    ['/professional-projects', 'Custom Engines', 'EVERGREEN', 2],
    ['/professional-projects', 'Web Development', 'MN Chrome Extension', 2],
  ] as const) {
    await page.goto(path)
    await page.getByRole('button', { name: new RegExp(category) }).click()
    await expect(page.locator('main .aspect-square')).toHaveCount(count)
    const card = page.getByRole('button', { name: new RegExp(title) })
    await card.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('dialog').getByRole('heading', { name: title, exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(card).toBeFocused()
  }
})

test('new database articles and modals render images between paragraphs, escaping HTML', async ({ page }) => {
  const content = { thumbnail: '/assets/images/DMT.png', body: [
    { type: 'paragraph', text: 'First <script>alert(1)</script>' },
    { type: 'image', src: '/assets/images/DMT.png', alt: 'Between paragraphs', caption: 'Caption' },
    { type: 'paragraph', text: 'Last paragraph' },
  ] }
  const extra = { slug: 'new-entry', title: 'New entry', page: 'portfolio', category: 'modeling', published: true, sort_order: 99, content }
  await mockDatabase(page, { Articles: [...seed.Articles, extra], Modals: [...seed.Modals, extra] })
  await page.goto('/articles?slug=new-entry')
  const article = page.locator('article')
  await expect(article.locator(':scope > *')).toHaveText(['First <script>alert(1)</script>', 'Caption', 'Last paragraph'])
  await expect(article.locator('script')).toHaveCount(0)
  await expect(article.getByAltText('Between paragraphs')).toBeVisible()
  await page.goto('/portfolio')
  await page.getByRole('button', { name: /Modeling/ }).click()
  await page.getByRole('button', { name: /New entry/ }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Last paragraph')).toBeVisible()
  const order = await dialog.locator('p, figure').evaluateAll(elements => elements.map(el => el.tagName))
  expect(order).toEqual(['P', 'FIGURE', 'P'])
})

test('database failure shows a recoverable error and retry fetches again', async ({ page }) => {
  await page.route('**/rest/v1/**', route => route.fulfill({ status: 503, json: { message: 'Unavailable' }, headers: { 'access-control-allow-origin': '*' } }))
  await page.goto('/LongMarch')
  await expect(page.locator('main').getByRole('alert')).toContainText('temporarily unavailable')
  await page.unroute('**/rest/v1/**')
  await mockDatabase(page)
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByText('The Long March has been released and is available to play!')).toBeVisible()
})

test('code and button grids render safely in articles and modals on desktop and mobile', async ({ page }) => {
  const code = 'const message = "<script>alert(1)</script>";\n\tconsole.log(message);\n// ' + 'long line '.repeat(40)
  const extra = { slug: 'code-demo', title: 'Code demo', page: 'portfolio', category: 'modeling', published: true, sort_order: 99, content: {
    thumbnail: '/assets/images/DMT.png', body: [
      { type: 'paragraph', text: 'Before code' },
      { type: 'code', code, language: 'javascript', filename: 'demo.js' },
      { type: 'group', layout: 'text', body: [
        { type: 'buttons', buttons: [
          { text: 'Play Long March', article: 'long-march', image: '/assets/images/DMT.png' },
          { text: 'Read the next article', article: 'next-demo' },
          { text: 'View source', href: 'https://github.com/example/project' },
        ] },
      ] },
      { type: 'paragraph', text: 'After buttons' },
      { type: 'code', code: '<img src=x onerror=alert(1)>', language: 'unknown-language' },
    ],
  } }
  const next = { ...extra, slug: 'next-demo', title: 'Next demo', content: { thumbnail: '/assets/images/DMT.png', body: [{ type: 'paragraph', text: 'The linked article' }] } }
  await mockDatabase(page, { Articles: [...seed.Articles, extra, next], Modals: [...seed.Modals, extra] })
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    for (const variant of ['article', 'modal']) {
      if (variant === 'article') await page.goto('/articles?slug=code-demo')
      else {
        await page.goto('/portfolio')
        await page.getByRole('button', { name: /Modeling/ }).click()
        await page.getByRole('button', { name: /Code demo/ }).click()
      }
      const body = variant === 'article' ? page.locator('article') : page.getByRole('dialog')
      const sample = body.locator('.code-block').first()
      await expect(sample.locator('code span').first()).toBeAttached()
      expect(await sample.locator('code').textContent()).toBe(code)
      expect(await sample.locator('code span').evaluateAll(tokens => new Set(tokens.map(token => getComputedStyle(token).color)).size)).toBeGreaterThan(1)
      await expect(body.locator('script, code img')).toHaveCount(0)
      await expect(body.locator('.code-block').last().locator('code')).toHaveText('<img src=x onerror=alert(1)>')
      expect(await sample.locator('pre').evaluate(el => el.scrollWidth > el.clientWidth)).toBe(true)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      const buttons = body.locator('.content-buttons')
      await expect(buttons.getByRole('link', { name: 'Play Long March' })).toHaveAttribute('href', '/LongMarch')
      await expect(buttons.getByRole('link', { name: 'Read the next article' })).toHaveAttribute('href', '/articles?slug=next-demo')
      const external = buttons.getByRole('link', { name: 'View source' })
      await expect(external).toHaveAttribute('href', 'https://github.com/example/project')
      await expect(external).toHaveAttribute('target', '_blank')
      await expect(external).toHaveAttribute('rel', 'noopener noreferrer')
      await expect(external).toHaveCSS('background-color', 'rgb(0, 0, 0)')
      await expect(external.locator('img')).toHaveCount(0)
      expect(await external.locator('span').evaluate(el => getComputedStyle(el).fontFamily)).toContain('Major Mono Display')
      await expect(buttons.locator('img')).toHaveAttribute('src', '/assets/images/DMT.png')
      const order = await body.locator('p, .code-block, .content-buttons').evaluateAll(elements => elements.map(el => el.classList.contains('code-block') ? 'code' : el.classList.contains('content-buttons') ? 'buttons' : el.textContent))
      expect(order).toEqual(['Before code', 'code', 'buttons', 'After buttons', 'code'])
      const columns = await buttons.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length)
      expect(columns).toBe(width === 390 ? 1 : 3)
      if (variant === 'modal') {
        // The last code sample is keyboard scrollable and stays in the trap.
        await body.locator('pre').last().focus()
        await page.keyboard.press('Tab')
        await expect(body.getByRole('button', { name: 'Close' })).toBeFocused()
        await page.keyboard.press('Shift+Tab')
        await expect(body.locator('pre').last()).toBeFocused()
        await page.keyboard.press('Escape')
        await expect(page.getByRole('dialog')).toHaveCount(0)
      }
    }
  }
  await page.goto('/articles?slug=code-demo')
  await page.getByRole('link', { name: 'Read the next article' }).click()
  await expect(page.locator('article')).toHaveText('The linked article')
})
