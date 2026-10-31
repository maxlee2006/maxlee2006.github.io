import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { originalCategories } from '../../lib/cms/categories'
import type { Category } from '../../lib/cms/content'
import { newDocument, type EditorRecord } from '../../lib/cms/editor'

type MockDatabase = { categories: Category[]; Articles: EditorRecord[]; Modals: EditorRecord[] }
const emptyDatabase = (): MockDatabase => ({ categories: originalCategories.map(category => ({ ...category })), Articles: [], Modals: [] })

// Fake only the HTTP boundary. The page still runs the real Supabase client,
// session handling, allowlist lookup, editor state, validation, and renderers.
// These tests never create accounts or write production content.
async function mockAdmin(page: Page, { allowed = true, wrongPassword = false, database = emptyDatabase(), failWrites = false } = {}) {
  const user = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'super@admin.maxlee2006.github.io', app_metadata: { provider: 'email' }, user_metadata: {}, created_at: '2026-10-25T00:00:00Z' }
  const payload = { sub: user.id, aud: 'authenticated', role: 'authenticated', email: user.email, exp: Math.floor(Date.now() / 1000) + 3600 }
  const token = `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.test-signature`
  const contentWrites: string[] = []
  await page.route('**/*', async route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return route.continue()
    const headers = { 'access-control-allow-origin': '*' }
    if (url.pathname === '/auth/v1/token') {
      const input = request.postDataJSON()
      expect(input.email).toBe(user.email)
      if (wrongPassword) return route.fulfill({ status: 400, json: { message: 'Invalid login credentials', code: 'invalid_credentials' }, headers })
      return route.fulfill({ json: { access_token: token, refresh_token: 'test-refresh-token', token_type: 'bearer', expires_in: 3600, user }, headers })
    }
    if (url.pathname === '/auth/v1/user') return route.fulfill({ json: user, headers })
    if (url.pathname === '/auth/v1/logout') return route.fulfill({ json: {}, headers })
    if (url.pathname === '/rest/v1/admin_users') {
      expect(request.method()).toBe('GET')
      expect(request.headers().authorization).toBe(`Bearer ${token}`)
      return route.fulfill({ json: allowed ? [{ user_id: user.id, username: 'super', active: true }] : [], headers })
    }
    if (url.pathname === '/rest/v1/categories') {
      if (request.method() === 'GET') return route.fulfill({ json: database.categories, headers })
      expect(request.method()).toBe('POST')
      expect(request.headers().authorization).toBe(`Bearer ${token}`)
      const row = request.postDataJSON()
      if (database.categories.some(category => category.page === row.page && category.slug === row.slug)) return route.fulfill({ status: 409, json: { code: '23505', message: 'duplicate' }, headers })
      database.categories.push(row)
      return route.fulfill({ status: 201, json: row, headers })
    }
    if (/\/rest\/v1\/(Articles|Modals)$/.test(url.pathname)) {
      const table = url.pathname.split('/').pop() as 'Articles' | 'Modals'
      if (request.method() === 'GET') return route.fulfill({ json: database[table].filter(row => url.searchParams.get('published') !== 'eq.true' || row.published), headers })
      contentWrites.push(request.method())
      expect(request.headers().authorization).toBe(`Bearer ${token}`)
      if (failWrites) return route.fulfill({ status: 503, json: { code: 'unavailable', message: 'Unavailable' }, headers })
      const row = request.postDataJSON() as EditorRecord
      const originalSlug = url.searchParams.get('slug')?.replace(/^eq\./, '')
      if (database[table].some(existing => existing.slug === row.slug && existing.slug !== originalSlug)) return route.fulfill({ status: 409, json: { code: '23505', message: 'duplicate' }, headers })
      if (request.method() === 'POST') database[table].push(row)
      else {
        expect(request.method()).toBe('PATCH')
        const index = database[table].findIndex(existing => existing.slug === originalSlug)
        if (index === -1) return route.fulfill({ status: 406, json: { code: 'PGRST116', message: 'Missing row' }, headers })
        database[table][index] = row
      }
      return route.fulfill({ json: row, headers })
    }
    return route.abort()
  })
  return contentWrites
}

async function login(page: Page, path = '/admin') {
  await page.goto(path)
  await expect(page.getByLabel('Username', { exact: true })).toHaveValue('super')
  await page.getByLabel('Password', { exact: true }).fill('test-password-only')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
}

test('login rejects bad passwords and users who are not on the admin allowlist', async ({ page }) => {
  await mockAdmin(page, { wrongPassword: true })
  await login(page)
  await expect(page.locator('form').getByRole('alert')).toContainText('Check your username and password')
  await expect(page.getByRole('region', { name: 'Document editor', exact: true })).toHaveCount(0)
  await page.unroute('**/*')
  await mockAdmin(page, { allowed: false })
  await login(page)
  await expect(page.locator('form').getByRole('alert')).toContainText('does not have admin access')
  await expect(page.getByRole('region', { name: 'Document editor', exact: true })).toHaveCount(0)
})

test('super can write interleaved media, preview both formats, and copy valid JSON without content writes', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const writes = await mockAdmin(page)
  await login(page)
  await expect(page.getByRole('region', { name: 'Document editor', exact: true })).toBeVisible()
  await page.getByLabel('Document title', { exact: true }).fill('My new project')
  await page.getByRole('textbox', { name: /^Slug/ }).fill('my-new-project')
  await page.getByRole('textbox', { name: /^Thumbnail URL/ }).fill('/assets/images/DMT.png')
  await page.getByLabel('Paragraph body.1', { exact: true }).fill('Before <script>alert(1)</script>')
  await page.getByRole('combobox', { name: 'Insert block', exact: true }).last().selectOption('image')
  await page.getByRole('textbox', { name: 'Image URL', exact: true }).fill('/assets/images/DMT.png')
  await page.getByRole('textbox', { name: /^Alt text/ }).fill('A middle image')
  await page.getByRole('textbox', { name: 'Caption', exact: true }).fill('Middle caption')
  await page.getByRole('combobox', { name: 'Insert block', exact: true }).last().selectOption('paragraph')
  await page.getByLabel('Paragraph body.3', { exact: true }).fill('After the image')
  const preview = page.getByLabel('Live website preview', { exact: true })
  await expect(preview.locator('article > *')).toHaveText(['Before <script>alert(1)</script>', 'Middle caption', 'After the image'])
  await expect(preview.locator('script')).toHaveCount(0)
  await page.getByRole('button', { name: 'Copy content JSON', exact: true }).click()
  const content = JSON.parse(await page.evaluate(() => navigator.clipboard.readText()))
  expect(content.body.map((block: { type: string }) => block.type)).toEqual(['paragraph', 'image', 'paragraph'])
  await page.getByRole('combobox', { name: 'Document format', exact: true }).selectOption('Modals')
  await expect(preview.getByRole('heading', { name: 'My new project', exact: true })).toBeVisible()
  await expect(preview.locator('p,figure')).toHaveText(['Before <script>alert(1)</script>', 'Middle caption', 'After the image'])
  await page.getByRole('button', { name: 'Copy full row', exact: true }).click()
  const row = JSON.parse(await page.evaluate(() => navigator.clipboard.readText()))
  expect(row.published).toBe(false)
  expect(row.slug).toBe('my-new-project')
  expect(row.content).toEqual(content)
  expect(writes).toEqual([])

  // A refresh restores this tab's login, but never pretends unsaved content was
  // saved. Sign out removes the session and the editor disappears.
  page.on('dialog', dialog => dialog.accept())
  await page.reload()
  await expect(page.getByRole('region', { name: 'Document editor', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Sign out', exact: true }).click()
  await expect(page.getByLabel('Username', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Username', { exact: true })).toBeVisible()
})

test('existing JSON imports without losing groups, invalid media prevents export, and mobile fits', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockAdmin(page)
  await login(page, '/admin')
  const row = JSON.parse(readFileSync('supabase/seed.json', 'utf8')).Articles[0]
  await page.getByRole('button', { name: 'Import JSON', exact: true }).click()
  await page.getByLabel('JSON to import', { exact: true }).fill(JSON.stringify(row))
  await page.getByRole('button', { name: 'Load JSON', exact: true }).click()
  await expect(page.getByLabel('Document title', { exact: true })).toHaveValue(row.title)
  await expect(page.getByRole('button', { name: 'Copy content JSON', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'JSON', exact: true }).click()
  const content = JSON.parse(await page.getByLabel('Generated JSON', { exact: true }).inputValue())
  expect(content.body).toEqual(row.content.body)
  await page.getByRole('combobox', { name: 'Insert block', exact: true }).first().selectOption('image')
  await page.getByRole('region', { name: 'Image block body.1', exact: true }).getByRole('textbox', { name: 'Image URL', exact: true }).fill('javascript:alert(1)')
  await expect(page.getByRole('button', { name: 'Copy content JSON', exact: true })).toBeDisabled()
  await expect(page.getByText('content.body.0.src', { exact: true })).toBeVisible()
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
  expect(fits).toBe(true)
})

test('sign out clears this tab even when Supabase cannot revoke the session', async ({ page }) => {
  await mockAdmin(page)
  await login(page)
  await expect(page.getByRole('region', { name: 'Document editor', exact: true })).toBeVisible()
  await page.route('**/auth/v1/logout*', route => route.fulfill({ status: 400, json: { message: 'Unavailable', code: 'bad_request' } }))
  page.on('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Sign out', exact: true }).click()
  await expect(page.locator('form').getByRole('alert')).toContainText('Signed out of this tab')
  await page.reload()
  await expect(page.getByLabel('Username', { exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Document editor', exact: true })).toHaveCount(0)
})

for (const width of [1280, 390]) test(`admin composes, previews, edits, and exports code and button grids at ${width}px`, async ({ page, context }) => {
  await page.setViewportSize({ width, height: 900 })
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const writes = await mockAdmin(page)
  await login(page)
  await page.getByLabel('Document title', { exact: true }).fill('Code project')
  await page.getByRole('textbox', { name: 'Slug', exact: true }).fill('code-project')
  await page.getByRole('textbox', { name: 'Thumbnail URL', exact: true }).fill('/assets/images/DMT.png')
  await page.getByLabel('Paragraph body.1', { exact: true }).fill('Before the code')
  await page.getByRole('combobox', { name: 'Insert block', exact: true }).last().selectOption('code')
  const code = 'const message = "<script>alert(1)</script>";\n\tconsole.log(message);\n// ' + 'long line '.repeat(30)
  await page.getByRole('textbox', { name: /^Code language/ }).fill('javascript')
  await page.getByLabel('Code filename (optional)', { exact: true }).fill('demo.js')
  await page.getByRole('textbox', { name: 'Source code', exact: true }).fill(code)
  const preview = page.getByLabel('Live website preview', { exact: true })
  await expect(preview.locator('code span').first()).toBeAttached()
  expect(await preview.locator('code').textContent()).toBe(code)
  expect(await preview.locator('code span').evaluateAll(tokens => new Set(tokens.map(token => getComputedStyle(token).color)).size)).toBeGreaterThan(1)
  await expect(preview.locator('script')).toHaveCount(0)

  await page.getByRole('combobox', { name: 'Insert block', exact: true }).last().selectOption('buttons')
  const grid = page.getByRole('region', { name: 'Button grid block body.3', exact: true })
  const first = grid.getByRole('group', { name: 'Button 1', exact: true })
  await first.getByLabel('Button text', { exact: true }).fill('Long March')
  await first.getByRole('combobox', { name: 'Destination type', exact: true }).selectOption('article')
  await first.getByLabel('Article slug', { exact: true }).fill('long-march')
  await first.getByRole('textbox', { name: /^Button image URL/ }).fill('/assets/images/DMT.png')
  await grid.getByRole('button', { name: 'Add button', exact: true }).click()
  const second = grid.getByRole('group', { name: 'Button 2', exact: true })
  await second.getByLabel('Button text', { exact: true }).fill('Website')
  await second.getByLabel('Link URL', { exact: true }).fill('https://example.com')
  // Switching destination types must remove the old field from the JSON.
  await second.getByRole('combobox', { name: 'Destination type', exact: true }).selectOption('article')
  await second.getByLabel('Article slug', { exact: true }).fill('temporary-article')
  await second.getByRole('combobox', { name: 'Destination type', exact: true }).selectOption('url')
  await second.getByLabel('Link URL', { exact: true }).fill('https://example.com')
  await grid.getByRole('button', { name: 'Move button 2 up', exact: true }).click()
  await grid.getByRole('button', { name: 'Add button', exact: true }).click()
  await grid.getByRole('button', { name: 'Remove button 3', exact: true }).click()
  const expectedButtons = [{ text: 'Website', href: 'https://example.com' }, { text: 'Long March', article: 'long-march', image: '/assets/images/DMT.png' }]
  for (const kind of ['Articles', 'Modals']) {
    await page.getByRole('combobox', { name: 'Document format', exact: true }).selectOption(kind)
    await expect(preview.locator('code span').first()).toBeAttached()
    expect(await preview.locator('code').textContent()).toBe(code)
    await expect(preview.locator('.content-button')).toHaveText(['Website', 'Long March'])
    await expect(preview.getByRole('link', { name: 'Long March', exact: true })).toHaveAttribute('href', '/LongMarch')
    await expect(preview.getByRole('link', { name: 'Website', exact: true })).toHaveCSS('background-color', 'rgb(0, 0, 0)')
    await expect(preview.locator('.content-button img')).toHaveAttribute('src', '/assets/images/DMT.png')
    await preview.getByRole('link', { name: 'Long March', exact: true }).click()
    await expect(page).toHaveURL(/\/admin$/)
    await page.getByRole('button', { name: 'Copy content JSON', exact: true }).click()
    const content = JSON.parse(await page.evaluate(() => navigator.clipboard.readText()))
    expect(content.body).toEqual([
      { type: 'paragraph', text: 'Before the code' },
      { type: 'code', code, language: 'javascript', filename: 'demo.js' },
      { type: 'buttons', buttons: expectedButtons },
    ])
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  // An unfinished URL neither appears in preview nor permits copying a row.
  await first.getByLabel('Button text', { exact: true }).fill('Unsafe link')
  await first.getByLabel('Link URL', { exact: true }).fill('javascript:alert(1)')
  await expect(preview.getByRole('link', { name: 'Unsafe link', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Copy content JSON', exact: true })).toBeDisabled()
  await first.getByLabel('Link URL', { exact: true }).fill('https://example.com')
  await first.getByRole('textbox', { name: /^Button image URL/ }).fill('javascript:alert(1)')
  await expect(preview.locator('.content-button img')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Copy full row', exact: true })).toBeDisabled()
  await first.getByRole('textbox', { name: /^Button image URL/ }).fill('')
  await expect(page.getByRole('button', { name: 'Copy full row', exact: true })).toBeEnabled()
  expect(writes).toEqual([])
})

test('imported nested code and button grids remain editable and export without data loss', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const writes = await mockAdmin(page)
  await login(page)
  const content = { thumbnail: '/assets/images/DMT.png', body: [{ type: 'group', layout: 'text', body: [
    { type: 'code', code: 'int main() { return 42; }', language: 'cpp', filename: 'main.cpp' },
    { type: 'buttons', buttons: [{ text: 'Project', article: 'long-march' }] },
  ] }] }
  await page.getByRole('button', { name: 'Import JSON', exact: true }).click()
  await page.getByLabel('JSON to import', { exact: true }).fill(JSON.stringify(content))
  await page.getByRole('button', { name: 'Load JSON', exact: true }).click()
  await page.getByLabel('Document title', { exact: true }).fill('Imported project')
  await page.getByRole('textbox', { name: 'Slug', exact: true }).fill('imported-project')
  await expect(page.getByRole('textbox', { name: 'Source code', exact: true })).toHaveValue('int main() { return 42; }')
  await page.getByRole('textbox', { name: 'Source code', exact: true }).fill('int main() {\n    return 7;\n}')
  await page.getByRole('textbox', { name: /^Code language/ }).fill('unknown-language')
  await page.getByLabel('Button text', { exact: true }).fill('Updated project')
  await page.getByLabel('Article slug', { exact: true }).fill('another-project')
  const preview = page.getByLabel('Live website preview', { exact: true })
  await expect(preview.locator('code')).toHaveText('int main() {\n    return 7;\n}')
  await expect(preview.getByRole('link', { name: 'Updated project', exact: true })).toHaveAttribute('href', '/articles?slug=another-project')
  await page.getByRole('button', { name: 'Copy full row', exact: true }).click()
  const row = JSON.parse(await page.evaluate(() => navigator.clipboard.readText()))
  expect(row.published).toBe(false)
  expect(row.content.body).toEqual([{ type: 'group', layout: 'text', body: [
    { type: 'code', code: 'int main() {\n    return 7;\n}', language: 'unknown-language', filename: 'main.cpp' },
    { type: 'buttons', buttons: [{ text: 'Updated project', article: 'another-project' }] },
  ] }])
  expect(writes).toEqual([])
})

for (const target of ['portfolio', 'design', 'professional-projects'] as const) test(`admins create a ${target} category and save, reopen, and publish modals`, async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const database = emptyDatabase()
  const writes = await mockAdmin(page, { database })
  await login(page)
    await page.getByRole('combobox', { name: 'Document format', exact: true }).selectOption('Modals')
    await page.getByRole('combobox', { name: 'Page', exact: true }).selectOption(target)
    await page.getByText('Create category', { exact: true }).first().click()
    const form = page.getByRole('form', { name: 'Create category', exact: true })
    const category = `new-${target}`
    await form.getByRole('textbox', { name: 'Category name', exact: true }).fill(`New ${target} work`)
    await form.getByRole('textbox', { name: 'Category slug', exact: true }).fill(category)
    await form.getByRole('button', { name: 'Create category', exact: true }).click()
    await expect(page.getByRole('combobox', { name: 'Category', exact: true })).toHaveValue(category)
    await page.getByLabel('Document title', { exact: true }).fill(`Saved ${target} modal`)
    await page.getByRole('textbox', { name: 'Slug', exact: true }).fill(category)
    await page.getByRole('textbox', { name: 'Thumbnail URL', exact: true }).fill('/assets/images/DMT.png')
    await page.getByLabel('Paragraph body.1', { exact: true }).fill('Saved directly from Admin')
    await page.getByRole('combobox', { name: 'Insert block', exact: true }).last().selectOption('code')
    await page.getByRole('textbox', { name: 'Source code', exact: true }).fill('const saved = true;')
    await page.getByRole('textbox', { name: /^Code language/ }).fill('javascript')
    await page.getByRole('combobox', { name: 'Insert block', exact: true }).last().selectOption('buttons')
    await page.getByRole('textbox', { name: 'Button text', exact: true }).fill('Project website')
    await page.getByRole('textbox', { name: 'Link URL', exact: true }).fill('https://example.com')
    await page.getByRole('button', { name: 'Save modal', exact: true }).click()
    await expect(page.locator('.admin-export').getByRole('status')).toContainText('Modal saved as a draft.')
    expect(database.Modals.find(row => row.slug === category)?.published).toBe(false)
    await page.goto(`/${target}`)
    await page.getByRole('button', { name: `New ${target} work`, exact: true }).click()
    await expect(page.getByRole('button', { name: new RegExp(`Saved ${target} modal`) })).toHaveCount(0)
    await page.goto('/admin')
    await page.getByRole('combobox', { name: 'Document format', exact: true }).selectOption('Modals')
    const picker = page.getByRole('combobox', { name: 'Open saved document', exact: true })
    await expect(picker.locator(`option[value="${category}"]`)).toHaveCount(1)
    await picker.selectOption(category)
    await expect(page.getByRole('textbox', { name: 'Source code', exact: true })).toHaveValue('const saved = true;')
    await page.getByRole('checkbox', { name: 'Published', exact: true }).check()
    await page.getByRole('button', { name: 'Save modal', exact: true }).click()
    await expect(page.locator('.admin-export').getByRole('status')).toContainText('Modal saved and published.')
    expect(database.Modals.filter(row => row.slug === category)).toHaveLength(1)
    await page.goto(`/${target}`)
    await page.getByRole('button', { name: `New ${target} work`, exact: true }).click()
    await page.getByRole('button', { name: new RegExp(`Saved ${target} modal`) }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.locator('code span').first()).toBeAttached()
    await expect(dialog.getByRole('link', { name: 'Project website', exact: true })).toHaveAttribute('href', 'https://example.com')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.keyboard.press('Escape')
  expect(writes).toEqual(['POST', 'PATCH'])
})

test('admins save articles, protect existing slugs, and retain edits after a failed save', async ({ page }) => {
  const database = emptyDatabase()
  const existing = newDocument()
  existing.title = 'Existing article'; existing.slug = 'existing-article'; existing.content.thumbnail = '/assets/images/DMT.png'
  database.Articles.push(existing)
  await mockAdmin(page, { database })
  await login(page)
  await page.getByLabel('Document title', { exact: true }).fill('New article')
  await page.getByRole('textbox', { name: 'Slug', exact: true }).fill('existing-article')
  await page.getByRole('textbox', { name: 'Thumbnail URL', exact: true }).fill('/assets/images/DMT.png')
  await page.getByLabel('Paragraph body.1', { exact: true }).fill('Keep my work')
  await page.getByRole('button', { name: 'Save article', exact: true }).click()
  await expect(page.locator('.admin-export').getByRole('status')).toContainText('That slug already exists')
  expect(database.Articles[0].title).toBe('Existing article')
  await page.getByRole('textbox', { name: 'Slug', exact: true }).fill('new-article')
  await page.route('**/rest/v1/Articles*', route => route.request().method() === 'POST'
    ? route.fulfill({ status: 503, json: { code: 'unavailable', message: 'Unavailable' }, headers: { 'access-control-allow-origin': '*' } })
    : route.fallback())
  await page.getByRole('button', { name: 'Save article', exact: true }).click()
  await expect(page.locator('.admin-export').getByRole('status')).toContainText('Your changes are still in the editor')
  await expect(page.getByLabel('Paragraph body.1', { exact: true })).toHaveValue('Keep my work')
  await page.unroute('**/rest/v1/Articles*')
  await page.getByRole('checkbox', { name: 'Published', exact: true }).check()
  await page.getByRole('button', { name: 'Save article', exact: true }).click()
  await expect(page.locator('.admin-export').getByRole('status')).toContainText('Article saved and published.')
  await expect(page.getByRole('button', { name: 'Save article', exact: true })).toBeDisabled()
  await page.goto('/articles?slug=new-article')
  await expect(page.locator('article')).toContainText('Keep my work')
})
