import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { PGlite } from '@electric-sql/pglite'

const migration = readFileSync('supabase/migrations/20261031014145_admin_content_and_categories.sql', 'utf8')
const adminId = '00000000-0000-4000-8000-000000000001'
const otherId = '00000000-0000-4000-8000-000000000002'
const content = JSON.stringify({ thumbnail: '/thumb.png', body: [{ type: 'code', code: 'int main() { return 0; }', language: 'cpp' }, { type: 'buttons', buttons: [{ text: 'Source', href: 'https://example.com' }] }] })

test('active admins create categories and save drafts/published content; all other visitors remain read-only', async () => {
  const db = new PGlite()
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users (id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to authenticated;
      grant execute on function auth.uid() to authenticated;
      insert into auth.users values ('${adminId}'),('${otherId}');`)
    await db.exec(readFileSync('supabase/migrations/202610200001_cms.sql', 'utf8'))
    await db.exec(readFileSync('supabase/seed.sql', 'utf8'))
    await db.exec(readFileSync('supabase/migrations/20261026041738_admin_users.sql', 'utf8'))
    await db.exec(`update public.admin_users set user_id='${adminId}' where username='super';`)
    const before = (await db.query('select slug,content from public."Articles" order by slug')).rows
    await db.exec(migration)
    await db.exec(`update public.categories set title='Owner title' where page='design' and slug='ue';`)
    await db.exec(migration)
    assert.deepEqual((await db.query('select slug,content from public."Articles" order by slug')).rows, before)
    assert.equal((await db.query<{ title: string }>("select title from public.categories where page='design' and slug='ue'")).rows[0].title, 'Owner title')
    await db.exec(`set role authenticated; set request.jwt.claim.sub='${adminId}';`)
    for (const page of ['portfolio', 'design', 'professional-projects']) {
      await db.query('insert into public.categories (page,slug,title) values ($1,$2,$3)', [page, 'new-work', 'New work'])
      for (const table of ['Articles', 'Modals']) {
        const slug = `${page}-${table.toLowerCase()}`
        await db.query(`insert into public."${table}" (slug,title,page,category,published,content) values ($1,'New project',$2,'new-work',false,$3::jsonb)`, [slug, page, content])
        assert.equal((await db.query(`select slug from public."${table}" where slug=$1 and not published`, [slug])).rows.length, 1)
        await db.query(`update public."${table}" set published=true,title='Published project' where slug=$1`, [slug])
        assert.equal((await db.query(`select slug from public."${table}" where slug=$1 and published`, [slug])).rows.length, 1)
        await assert.rejects(db.query(`insert into public."${table}" (slug,title,page,category,published,content) values ($1,'Duplicate',$2,'new-work',true,$3::jsonb)`, [slug, page, content]), /duplicate key/)
        await assert.rejects(db.exec(`delete from public."${table}"`), /permission denied/)
        await assert.rejects(db.exec(`truncate public."${table}"`), /permission denied/)
        await assert.rejects(db.query(`update public."${table}" set category='missing-category' where slug=$1`, [slug]), /foreign key/)
        await assert.rejects(db.query(`update public."${table}" set id=500 where slug=$1`, [slug]), /permission denied/)
      }
    }
    await assert.rejects(db.exec("insert into public.categories (page,slug,title) values ('unrecognized','slug','No')"), /check constraint/)
    await assert.rejects(db.exec("update public.admin_users set active=true"), /permission denied/)
    await db.exec(`update public."Articles" set published=false where slug='portfolio-articles'; reset role;`)
    // Even a legacy permissive policy cannot broaden access past our guards.
    await db.exec(`create policy legacy_open on public."Articles" for all to public using (true) with check (true);`)
    for (const role of ['anon', 'authenticated']) {
      await db.exec(`set role ${role}; set request.jwt.claim.sub='${otherId}';`)
      assert.equal((await db.query('select slug from public."Articles" where not published')).rows.length, 0)
      assert.equal((await db.query('select slug from public.categories')).rows.length, 9)
      await assert.rejects(db.query('insert into public."Articles" (slug,title,page,category,published,content) values (\'forbidden\',\'Forbidden\',\'portfolio\',\'modeling\',true,$1::jsonb)', [content]), /permission denied|row-level security/)
      await assert.rejects(db.exec("insert into public.categories (page,slug,title) values ('portfolio','forbidden','Forbidden')"), /permission denied|row-level security/)
      if (role === 'authenticated') assert.equal((await db.query('update public."Articles" set title=\'Tampered\' returning slug')).rows.length, 0)
      else await assert.rejects(db.exec('update public."Articles" set title=\'Tampered\''), /permission denied/)
      await db.exec('reset role')
    }
    await db.exec(`update public.admin_users set active=false where username='super'; set role authenticated; set request.jwt.claim.sub='${adminId}';`)
    assert.equal((await db.query('select slug from public."Articles" where not published')).rows.length, 0)
    assert.equal((await db.query('update public."Articles" set title=\'Revoked\' returning slug')).rows.length, 0)
    await assert.rejects(db.exec("insert into public.categories (page,slug,title) values ('design','revoked','Revoked')"), /row-level security/)
    await assert.rejects(db.query('insert into public."Modals" (slug,title,page,category,published,content) values (\'revoked\',\'Revoked\',\'portfolio\',\'modeling\',false,$1::jsonb)', [content]), /row-level security/)
    await db.exec('reset role; update public.admin_users set active=true;')
    await db.exec(readFileSync('supabase/tests/admin-publishing-security.sql', 'utf8'))
  } finally { await db.close() }
})
