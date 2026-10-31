import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'

// Fake only the HTTP boundary. The page still runs the real Supabase client,
// session handling, allowlist lookup, editor state, validation, and renderers.
// These tests never create accounts or write production content.
async function mockAdmin(page: Page, { allowed = true, wrongPassword = false } = {}) {
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
    if (/\/rest\/v1\/(Articles|Modals)/.test(url.pathname)) {
      if (request.method() !== 'GET') contentWrites.push(request.method())
      return route.fulfill({ json: [], headers })
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
