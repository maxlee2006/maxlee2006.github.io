import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'

const seed = JSON.parse(readFileSync('supabase/seed.json', 'utf8'))
async function mockDatabase(page: Page, data = seed) {
  await page.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return route.continue()
    if (url.pathname.startsWith('/rest/v1/')) {
      expect(route.request().method()).toBe('GET')
      expect(url.searchParams.get('published')).toBe('eq.true')
      const table = url.pathname.split('/').pop()!
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
