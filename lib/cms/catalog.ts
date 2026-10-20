import { createClient } from '../../utils/supabase/client'
import { recordSchema, type Catalog, type CmsRecord } from './content'

/** Read and validate every published row in one table.
 * A row is one article/modal; a column is a field such as title or content.
 * Supabase converts this query chain into HTTP GET requests and returns JSON.
 * These methods only read data; they never insert, update, or delete rows.
 */
export async function readTable(table: 'Articles' | 'Modals'): Promise<CmsRecord[]> {
  const records: CmsRecord[] = []
  // Read in batches so a growing table doesn't stop at the API's row limit.
  // offset is the number already requested; range() includes BOTH endpoints.
  const pageSize = 500
  for (let offset = 0; ; offset += pageSize) {
    // select chooses columns; eq filters rows; order makes batch order stable
    // when the data is unchanged. Concurrent owner edits aren't a frozen snapshot.
    // published=true describes what we want, but is NOT a security boundary:
    // Supabase's database policies hide drafts even if someone removes this filter.
    // Stop waiting after 15 seconds so the page can offer a useful retry.
    const { data, error } = await createClient().from(table)
      .select('slug,title,page,category,sort_order,published,content')
      .eq('published', true).order('sort_order').order('slug').range(offset, offset + pageSize - 1)
      .abortSignal(AbortSignal.timeout(15000))
    if (error) throw new Error(`Could not load ${table}. Please try again later.`)
    if (!data) throw new Error(`No response received for ${table}.`)
    // Network data is untrusted until checked. TypeScript types alone disappear
    // at runtime, so Zod checks each actual response before it reaches the UI.
    for (const row of data) {
      const parsed = recordSchema.safeParse(row)
      if (!parsed.success) {
        // Keep field details in the developer console, with a simpler page error.
        // Reject the catalog rather than quietly showing an incomplete project list.
        console.error(`Invalid ${table} record`, row.slug, parsed.error.issues)
        throw new Error(`Some ${table} content needs attention. Please try again later.`)
      }
      records.push(parsed.data)
    }
    // A short (or empty) batch means we reached the end. An exactly full final
    // batch causes one extra, empty request, which is safe.
    if (data.length < pageSize) return records
  }
}

let pending: Promise<Catalog> | undefined
export function readCatalog(): Promise<Catalog> {
  // A Promise represents a result that will arrive later. If several mounted
  // components ask while a read is in progress, they share that same Promise.
  // Both tables are requested together. finally clears it on success OR failure,
  // so a later page visit/retry can fetch again. This isn't a permanent cache or
  // a live subscription: an open page doesn't automatically receive owner edits.
  if (!pending) {
    pending = Promise.all([readTable('Articles'), readTable('Modals')])
      .then(([articles, modals]) => ({ articles, modals }))
      .finally(() => { pending = undefined })
  }
  return pending
}
