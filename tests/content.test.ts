import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { isSafeEmbed, isSafeUrl, recordSchema, recordSchemaFor, articleHref, categorySchema } from '../lib/cms/content'
import { originalCategories } from '../lib/cms/categories'

const seed = JSON.parse(readFileSync(new URL('../supabase/seed.json', import.meta.url), 'utf8'))
test('the complete original content import validates', () => {
  assert.equal(seed.Articles.length, 1)
  assert.equal(seed.Modals.length, 12)
  for (const table of [seed.Articles, seed.Modals]) for (const row of table) recordSchema.parse(row)
  assert.equal(seed.Articles[0].content.body[0].body.length, 5)
  assert.equal(seed.Articles[0].content.body[2].body.length, 3)
  assert.equal(seed.Modals.filter((row: { page: string }) => row.page === 'portfolio').length, 8)
})
test('ordered JSON accepts paragraph, image, paragraph in both tables', () => {
  for (const row of [seed.Articles[0], seed.Modals[0]]) {
    const record = recordSchema.parse({ ...row, content: { ...row.content, body: [
      { type: 'paragraph', text: 'Before' }, { type: 'image', src: '/example.jpg', alt: 'Example' }, { type: 'paragraph', text: 'After' },
    ] } })
    assert.deepEqual(record.content.body.map(b => b.type), ['paragraph', 'image', 'paragraph'])
  }
})
test('URLs reject scripts, protocol-relative addresses, credentials, and untrusted embeds', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,hi', '//evil.example/image', '/\\evil.example', 'http://example.com', 'https://user:pass@example.com', 'https://example.com/\n']) assert.equal(isSafeUrl(url), false, url)
  for (const url of ['https://youtube.com.evil.example/embed/test', 'https://evil.example/', '/video', 'https://youtube.com/watch?v=test', 'https://youtube.com:4000/embed/test']) assert.equal(isSafeEmbed(url), false, url)
  assert.equal(isSafeUrl('/assets/images/Vicar.gif'), true)
  assert.equal(isSafeEmbed('https://youtube.com/embed/exs0QeAbhKg'), true)
})
test('invalid content is rejected rather than silently lost', () => {
  for (const block of [{ type: 'raw-html', html: '<script />' }, { type: 'image', src: 'javascript:alert(1)', alt: '' }, { type: 'embed', src: 'https://evil.example', title: '' }]) {
    assert.equal(recordSchema.safeParse({ ...seed.Articles[0], content: { ...seed.Articles[0].content, body: [block] } }).success, false)
  }
  assert.equal(recordSchemaFor(originalCategories).safeParse({ ...seed.Articles[0], category: 'typo' }).success, false)
  assert.equal(recordSchema.safeParse({ ...seed.Articles[0], published: false }).success, false)
})

test('database categories extend placements while rejecting missing or wrong-page categories', () => {
  const extra = categorySchema.parse({ page: 'portfolio', slug: 'new-category', title: 'New category' })
  const schema = recordSchemaFor([...originalCategories, extra])
  assert.equal(schema.safeParse({ ...seed.Articles[0], page: 'portfolio', category: extra.slug }).success, true)
  assert.equal(schema.safeParse({ ...seed.Articles[0], page: 'design', category: extra.slug }).success, false)
  assert.equal(categorySchema.safeParse({ ...extra, image: 'javascript:alert(1)' }).success, false)
})
test('article links preserve the existing URL and encode new slugs', () => {
  assert.equal(articleHref('long-march'), '/LongMarch')
  assert.equal(articleHref('another-article'), '/articles?slug=another-article')
})

test('code samples and button grids validate in order and in groups for both tables', () => {
  const blocks = [
    { type: 'paragraph', text: 'Before' },
    { type: 'code', code: '#include <iostream>\nint main() { return 0; }', language: 'cpp', filename: 'main.cpp' },
    { type: 'buttons', buttons: [
      { text: 'Long March', article: 'long-march', image: '/assets/images/DMT.png' },
      { text: 'Another article', article: 'another-article' },
      { text: 'Source code', href: 'https://github.com/example/project', image: 'https://example.com/image.png' },
      { text: 'All articles', href: '/articles' },
    ] },
    { type: 'group', layout: 'text', body: [{ type: 'code', code: 'plain text' }] },
    { type: 'paragraph', text: 'After' },
  ]
  for (const row of [seed.Articles[0], seed.Modals[0]]) {
    const record = recordSchema.parse({ ...row, content: { ...row.content, body: blocks } })
    assert.deepEqual(record.content.body, blocks)
  }
})

test('button grids reject unsafe URLs, ambiguous destinations, and invalid arrays', () => {
  const invalidButtons = [
    { text: 'Missing destination' },
    { text: 'Both', article: 'long-march', href: 'https://example.com' },
    { text: 'Invalid slug', article: '../other' },
    { text: 'Script', href: 'javascript:alert(1)' },
    { text: 'Ambiguous', href: '//evil.example' },
    { text: 'Bad image', article: 'long-march', image: 'data:image/svg+xml,<svg/>' },
    { text: 'Bad image', href: '/articles', image: 'https://user:password@example.com/image.png' },
    { text: ' ', href: '/articles' },
  ]
  for (const buttons of [[], ...invalidButtons.map(button => [button]), Array(101).fill({ text: 'Link', href: '/articles' })]) {
    assert.equal(recordSchema.safeParse({ ...seed.Articles[0], content: { ...seed.Articles[0].content, body: [{ type: 'buttons', buttons }] } }).success, false)
  }
})

test('code requires source text, allows unknown language fallback, and bounds sample size', () => {
  for (const block of [{ type: 'code' }, { type: 'code', code: 42 }, { type: 'code', code: 'x'.repeat(100001) }, { type: 'code', code: '', language: '' }]) {
    assert.equal(recordSchema.safeParse({ ...seed.Articles[0], content: { ...seed.Articles[0].content, body: [block] } }).success, false)
  }
  for (const block of [{ type: 'code', code: '' }, { type: 'code', code: '<script>alert(1)</script>', language: 'future-language' }]) {
    assert.equal(recordSchema.safeParse({ ...seed.Articles[0], content: { ...seed.Articles[0].content, body: [block] } }).success, true)
  }
})
