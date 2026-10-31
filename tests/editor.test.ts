import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { PGlite } from '@electric-sql/pglite'
import { exportDocument, importDocument, newDocument, previewBlocks } from '../lib/cms/editor'
import { recordSchema } from '../lib/cms/content'
import { usernameIdentifier } from '../utils/supabase/admin'

test('all imported articles and modals round-trip through the editor without losing content', () => {
  const seed = JSON.parse(readFileSync('supabase/seed.json', 'utf8'))
  for (const row of [...seed.Articles, ...seed.Modals]) {
    const document = importDocument(JSON.stringify(row), newDocument())
    assert.deepEqual(exportDocument(document).row, recordSchema.parse(row))
  }
})

test('draft exports keep paragraph/image order, optional overrides, and published=false', () => {
  const record = newDocument()
  record.title = 'A project'; record.slug = 'a-project'; record.content.thumbnail = '/thumb.png'
  record.content.card_date = ''
  record.content.body = [{ type: 'paragraph', text: 'Before' }, { type: 'image', src: 'https://example.com/image.png', alt: 'Between', caption: 'Caption' }, { type: 'paragraph', text: 'After' }]
  const exported = exportDocument(record)
  assert.equal(exported.row.published, false)
  assert.equal(exported.content.card_date, '')
  assert.deepEqual(exported.content.body.map(block => block.type), ['paragraph', 'image', 'paragraph'])
  assert.deepEqual(importDocument(JSON.stringify(exported.row), newDocument()), exported.row)
  record.content.body[1] = { type: 'image', src: 'javascript:alert(1)', alt: '' }
  assert.throws(() => exportDocument(record))
})

test('username login normalizes super without accepting arbitrary email identifiers', () => {
  assert.equal(usernameIdentifier(' Super '), 'super@admin.maxlee2006.github.io')
  assert.throws(() => usernameIdentifier('somebody@example.com'))
  assert.throws(() => usernameIdentifier('../super'))
})

test('code and button arrays round-trip in full rows and content-only imports, including groups', () => {
  const record = newDocument()
  record.title = 'Code project'; record.slug = 'code-project'; record.content.thumbnail = '/thumb.png'
  record.content.body = [
    { type: 'code', code: 'const html = "<script>alert(1)</script>";\n\tconsole.log(html);', language: 'javascript', filename: 'demo.js' },
    { type: 'group', layout: 'text', body: [
      { type: 'buttons', buttons: [
        { text: 'Long March', article: 'long-march', image: '/project.png' },
        { text: 'Website', href: 'https://example.com' },
      ] },
      { type: 'code', code: 'Unhighlighted text' },
    ] },
  ]
  const exported = exportDocument(record)
  assert.deepEqual(exported.content.body, record.content.body)
  assert.deepEqual(importDocument(JSON.stringify(exported.row), newDocument()), exported.row)
  assert.deepEqual(importDocument(JSON.stringify(exported.content), newDocument()).content, exported.content)
})

test('unfinished button destinations and images stay safe in nested previews without altering exports', () => {
  const record = newDocument()
  record.title = 'Draft'; record.slug = 'draft'; record.content.thumbnail = '/thumb.png'
  record.content.body = [{ type: 'group', layout: 'text', body: [
    { type: 'code', code: '<img src=x onerror=alert(1)>' },
    { type: 'buttons', buttons: [
      { text: 'Unfinished', href: '' },
      { text: 'Unsafe', href: 'javascript:alert(1)' },
      { text: 'Invalid slug', article: '../other' },
      { text: 'Article', article: 'long-march', image: 'javascript:alert(1)' },
      { text: 'Website', href: 'https://example.com', image: '/image.png' },
    ] },
    { type: 'buttons', buttons: [{ text: '', href: '' }] },
  ] }]
  const before = JSON.stringify(record)
  assert.deepEqual(previewBlocks(record.content.body), [{ type: 'group', layout: 'text', body: [
    { type: 'code', code: '<img src=x onerror=alert(1)>' },
    { type: 'buttons', buttons: [
      { text: 'Article', article: 'long-march', image: undefined },
      { text: 'Website', href: 'https://example.com', image: '/image.png' },
    ] },
  ] }])
  assert.equal(JSON.stringify(record), before)
  assert.throws(() => exportDocument(record))
})

test('admin access is restricted to the linked active user and cannot grant itself privileges', async () => {
  // This is a disposable local database. Simulate Auth's signed user id without
  // creating, modifying, or deleting any production authentication accounts.
  const db = new PGlite()
  try {
    await db.exec(`create role anon; create role authenticated;
      create schema auth; create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to authenticated;
      grant execute on function auth.uid() to authenticated;
      insert into auth.users values ('00000000-0000-4000-8000-000000000001'), ('00000000-0000-4000-8000-000000000002');`)
    await db.exec(readFileSync('supabase/migrations/20261026041738_admin_users.sql', 'utf8'))
    await db.exec(`update public.admin_users set user_id='00000000-0000-4000-8000-000000000001' where username='super';
      set role anon;`)
    await assert.rejects(db.exec('select username from public.admin_users'), /permission denied/)
    await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub='00000000-0000-4000-8000-000000000002';`)
    assert.deepEqual((await db.query('select username,user_id,active from public.admin_users')).rows, [])
    await db.exec(`set request.jwt.claim.sub='00000000-0000-4000-8000-000000000001';`)
    assert.equal((await db.query<{ username: string }>('select username from public.admin_users')).rows[0].username, 'super')
    await assert.rejects(db.exec("insert into public.admin_users (username) values ('intruder')"), /permission denied/)
    await assert.rejects(db.exec("update public.admin_users set active=true"), /permission denied/)
    await assert.rejects(db.exec('delete from public.admin_users'), /permission denied/)
    await db.exec('reset role; update public.admin_users set active=false; set role authenticated;')
    assert.deepEqual((await db.query('select username from public.admin_users')).rows, [])
  } finally { await db.close() }
})
