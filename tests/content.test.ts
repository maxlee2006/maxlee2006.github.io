import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { isSafeEmbed, isSafeUrl, recordSchema, articleHref } from '../lib/cms/content'

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
  assert.equal(recordSchema.safeParse({ ...seed.Articles[0], category: 'typo' }).success, false)
  assert.equal(recordSchema.safeParse({ ...seed.Articles[0], published: false }).success, false)
})
test('article links preserve the existing URL and encode new slugs', () => {
  assert.equal(articleHref('long-march'), '/LongMarch')
  assert.equal(articleHref('another-article'), '/articles?slug=another-article')
})
