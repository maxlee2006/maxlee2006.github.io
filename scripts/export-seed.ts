import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { recordSchema } from '../lib/cms/content'

/** Generate SQL text; this script does NOT connect to or change a database.
 * seed.json is the one-time backup of pre-CMS content, not the live website's
 * data source. The owner separately runs the generated SQL in SQL Editor.
 */
export function seedSql(): string {
  const seed = JSON.parse(readFileSync(fileURLToPath(new URL('../supabase/seed.json', import.meta.url)), 'utf8'))
  // BEGIN/COMMIT make the eventual import a transaction: either the whole
  // import succeeds, or an error prevents a partially imported set of projects.
  const statements = ['begin;']
  for (const table of ['Articles', 'Modals'] as const) {
    for (const row of seed[table]) {
      // Validate first and include schema defaults in the generated payload.
      // ON CONFLICT below skips an existing slug, preserving owner edits. It
      // does not merge fields or update a project that has already been imported.
      const record = recordSchema.parse(row)
      // SQL dollar quoting wraps JSON without treating its apostrophes as SQL
      // syntax. Reject our delimiter inside the data so it cannot end that wrapper.
      const json = JSON.stringify(record)
      if (json.includes('$cms_seed$')) throw new Error('Seed contains SQL delimiter')
      statements.push(`insert into public."${table}" (slug,title,page,category,sort_order,published,content)
select slug,title,page,category,sort_order,published,content
from jsonb_to_record($cms_seed$${json}$cms_seed$::jsonb)
as row(slug text,title text,page text,category text,sort_order integer,published boolean,content jsonb)
on conflict (slug) do nothing;`)
    }
  }
  statements.push('commit;')
  return statements.join('\n\n') + '\n'
}

// Print only when invoked directly; tests import seedSql without printing.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.stdout.write(seedSql())
