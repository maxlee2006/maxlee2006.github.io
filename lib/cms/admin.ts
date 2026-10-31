import { createAdminClient } from '../../utils/supabase/admin'
import { categorySchema, recordSchemaFor, type Category } from './content'
import { readCategories } from './categories'
import { exportDocument, importDocument, newDocument, type EditorKind, type EditorRecord } from './editor'

const columns = 'slug,title,page,category,sort_order,published,content'

function saveError(error: { code?: string; message: string }): Error {
  if (error.code === '23505') return new Error('That slug already exists here. Open the saved item to edit it, or choose another slug.')
  if (error.code === '23503') return new Error('Choose a category that belongs to this page, then try again.')
  if (error.code === '42501' || error.code === 'PGRST301') return new Error('Saving requires an active admin account. Sign in again and try again.')
  return new Error('Could not save. Your changes are still in the editor. Please try again.')
}

export async function readSavedDocuments(kind: EditorKind): Promise<EditorRecord[]> {
  const records: EditorRecord[] = []
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await createAdminClient().from(kind).select(columns)
      .order('sort_order').order('slug').range(offset, offset + 499).abortSignal(AbortSignal.timeout(15000))
    if (error || !data) throw new Error('Could not load saved documents. Please try again.')
    records.push(...data.map(row => importDocument(JSON.stringify(row), newDocument())))
    if (data.length < 500) return records
  }
}

export async function saveDocument(kind: EditorKind, record: EditorRecord, originalSlug?: string): Promise<EditorRecord> {
  const categories = await readCategories()
  recordSchemaFor(categories).parse({ ...record, published: true })
  const row = exportDocument(record).row
  const table = createAdminClient().from(kind)
  // An import is a new document. Only opening a saved row or successfully
  // creating it supplies originalSlug. Never upsert over a matching stranger.
  const query = originalSlug ? table.update(row).eq('slug', originalSlug) : table.insert(row)
  const { data, error } = await query.select(columns).abortSignal(AbortSignal.timeout(15000)).single()
  if (error) throw saveError(error)
  if (!data) throw new Error('The saved document could not be confirmed. Refresh the saved list before trying again.')
  return importDocument(JSON.stringify(data), newDocument())
}

export async function createCategory(category: Category): Promise<Category> {
  const row = categorySchema.parse(category)
  const { data, error } = await createAdminClient().from('categories').insert(row)
    .select('page,slug,title,image,logo,image_position,columns,sort_order').abortSignal(AbortSignal.timeout(15000)).single()
  if (error?.code === '23505') throw new Error('A category with that slug already exists on this page. Choose another slug.')
  if (error) throw saveError(error)
  return categorySchema.parse(data)
}
