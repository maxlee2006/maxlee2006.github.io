import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { recordSchema } from '../lib/cms/content'

export function seedSql(): string {
  const seed = JSON.parse(readFileSync(fileURLToPath(new URL('../supabase/seed.json', import.meta.url)), 'utf8'))
  const statements = ['begin;']
  for (const table of ['Articles', 'Modals'] as const) {
    for (const row of seed[table]) {
      const record = recordSchema.parse(row)
      // Dollar quoting is safe only with a delimiter absent from the JSON payload.
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

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.stdout.write(seedSql())
