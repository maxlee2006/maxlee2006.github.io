import { createClient } from '../../utils/supabase/client'
import { recordSchema, type Catalog, type CmsRecord } from './content'

export async function readTable(table: 'Articles' | 'Modals'): Promise<CmsRecord[]> {
  const records: CmsRecord[] = []
  const pageSize = 500
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await createClient().from(table)
      .select('slug,title,page,category,sort_order,published,content')
      .eq('published', true).order('sort_order').order('slug').range(offset, offset + pageSize - 1)
      .abortSignal(AbortSignal.timeout(15000))
    if (error) throw new Error(`Could not load ${table}. Please try again later.`)
    if (!data) throw new Error(`No response received for ${table}.`)
    for (const row of data) {
      const parsed = recordSchema.safeParse(row)
      if (!parsed.success) {
        console.error(`Invalid ${table} record`, row.slug, parsed.error.issues)
        throw new Error(`Some ${table} content needs attention. Please try again later.`)
      }
      records.push(parsed.data)
    }
    if (data.length < pageSize) return records
  }
}

let pending: Promise<Catalog> | undefined
export function readCatalog(): Promise<Catalog> {
  // Deduplicate concurrent consumers; a later visit always reads current content.
  if (!pending) {
    pending = Promise.all([readTable('Articles'), readTable('Modals')])
      .then(([articles, modals]) => ({ articles, modals }))
      .finally(() => { pending = undefined })
  }
  return pending
}
