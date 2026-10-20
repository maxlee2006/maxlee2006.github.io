import { loadEnvConfig } from '@next/env'
import { createClient } from '@supabase/supabase-js'
import { recordSchema } from '../lib/cms/content'

loadEnvConfig(process.cwd())
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Missing public Supabase configuration')
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  for (const table of ['Articles', 'Modals'] as const) {
    let count = 0
    const slugs: string[] = []
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await client.from(table).select('slug,title,page,category,sort_order,published,content').eq('published', true).order('sort_order').order('slug').range(offset, offset + 499).abortSignal(AbortSignal.timeout(15000))
      if (error) throw new Error(`${table}: ${error.message}`)
      for (const row of data ?? []) { slugs.push(recordSchema.parse(row).slug); count++ }
      if (!data || data.length < 500) break
    }
    if (!count) throw new Error(`${table}: no published content is readable. Apply the migration and import the seed before deploying.`)
    if (table === 'Articles' && !slugs.includes('long-march')) throw new Error('The /LongMarch article is missing or unpublished')
    console.log(`${table}: ${count} published records validated`)
  }
  console.log('Read-only content check passed. This does not verify live write restrictions; see docs/CMS.md.')
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
