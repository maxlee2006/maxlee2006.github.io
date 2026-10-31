import { loadEnvConfig } from '@next/env'
import { createClient } from '@supabase/supabase-js'
import { recordSchemaFor } from '../lib/cms/content'
import { readCategories } from '../lib/cms/categories'

// Command-line preflight, not code shipped to the browser. Use the same .env
// loading rules as Next.js; GitHub Actions can supply the values directly.
// Node 24's --use-env-proxy (in package.json) honors the cloud network proxy.
loadEnvConfig(process.cwd())
async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Missing public Supabase configuration')
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const categories = await readCategories()
  const recordSchema = recordSchemaFor(categories)
  console.log(`Categories: ${categories.length} validated`)
  // Read via the public API just like a visitor, including batching, ordering,
  // timeout, and runtime JSON validation. A successful build alone cannot prove
  // this path works: static export doesn't fetch articles during compilation.
  for (const table of ['Articles', 'Modals'] as const) {
    let count = 0
    const slugs: string[] = []
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await client.from(table).select('slug,title,page,category,sort_order,published,content').eq('published', true).order('sort_order').order('slug').range(offset, offset + 499).abortSignal(AbortSignal.timeout(15000))
      if (error) throw new Error(`${table}: ${error.message}`)
      for (const row of data ?? []) { slugs.push(recordSchema.parse(row).slug); count++ }
      if (!data || data.length < 500) break
    }
    // Guard against a technically successful response with missing import data.
    // Counts may grow as the owner publishes more rows; they aren't fixed at 1/12.
    if (!count) throw new Error(`${table}: no published content is readable. Apply the migration and import the seed before deploying.`)
    if (table === 'Articles' && !slugs.includes('long-march')) throw new Error('The /LongMarch article is missing or unpublished')
    console.log(`${table}: ${count} published records validated`)
  }
  console.log('Read-only content check passed. This does not verify live write restrictions; see docs/CMS.md.')
}
// Exit nonzero on failure so the deployment workflow stops before publishing.
// Only SELECT requests are made; write restrictions require separate SQL checks.
main().catch(error => { console.error(error.message); process.exitCode = 1 })
