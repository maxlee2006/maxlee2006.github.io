import { buttonSchema, isSafeEmbed, isSafeUrl, recordSchema, type CmsRecord, type ContentBlock } from './content'

// These names match the actual Supabase tables. The editor never calls them;
// it uses this choice to label the preview and manual-paste instructions.
export type EditorKind = 'Articles' | 'Modals'
// Public records are always published=true. A local document can be a draft,
// so only that one field needs a different type in the editor.
export type EditorRecord = Omit<CmsRecord, 'published'> & { published: boolean }

export const placements = {
  portfolio: ['modeling', 'animation', 'sketches'],
  design: ['ue'],
  'professional-projects': ['custom-engines', 'web-development'],
} as const

export function newDocument(): EditorRecord {
  // Empty required values make validation explain what still needs filling in.
  // published=false is a safe default when copying a complete new database row.
  return {
    title: '', slug: '', page: 'portfolio', category: 'modeling', sort_order: 0, published: false,
    content: {
      thumbnail: '', date: '', method: '', description: '', subtitle: '',
      featured: false, featured_description: '', body: [{ type: 'paragraph', text: '' }],
    },
  }
}

export function newBlock(type: ContentBlock['type']): ContentBlock {
  // The type selects the relevant fields; an image needs src/alt, for example,
  // while a paragraph only needs text. These are data objects, never HTML.
  switch (type) {
    case 'paragraph': return { type, text: '' }
    case 'heading': return { type, text: '' }
    case 'image': return { type, src: '', alt: '' }
    case 'link': return { type, href: '', text: '' }
    case 'code': return { type, code: '', language: 'text' }
    case 'buttons': return { type, buttons: [{ text: '', href: '' }] }
    case 'embed': return { type, src: '', title: '' }
    case 'group': return { type, layout: 'text', body: [] }
  }
}

// Drafts contain unfinished fields. Preview only safe destinations, and omit
// unfinished images while retaining a valid button's black background. Export
// still validates the complete document, so no field is silently lost there.
export function previewBlocks(body: ContentBlock[]): ContentBlock[] {
  return body.flatMap<ContentBlock>(block => {
    if (block.type === 'group') return [{ ...block, body: previewBlocks(block.body) }]
    if (block.type === 'image' && !isSafeUrl(block.src)) return []
    if (block.type === 'link' && !isSafeUrl(block.href)) return []
    if (block.type === 'buttons') {
      const buttons = block.buttons.flatMap(button => {
        const parsed = buttonSchema.safeParse({ ...button, image: undefined })
        if (!parsed.success) return []
        return [{ ...parsed.data, image: button.image && isSafeUrl(button.image) ? button.image : undefined }]
      })
      return buttons.length ? [{ ...block, buttons }] : []
    }
    if (block.type === 'embed') {
      if (!isSafeEmbed(block.src)) return []
      return [{ ...block, height: block.height && Number.isInteger(block.height) && block.height >= 100 && block.height <= 1000 ? block.height : undefined }]
    }
    return [block]
  })
}

// The public schema deliberately accepts published rows only. Validate a draft
// against all the same content rules, then restore its chosen published flag.
export function validateDocument(record: EditorRecord) {
  return recordSchema.safeParse({ ...record, published: true })
}

export function exportDocument(record: EditorRecord): { row: EditorRecord; content: CmsRecord['content'] } {
  // parse() checks actual values and supplies the same defaults as live reads.
  // Keeping this shared avoids an editor format drifting from the website.
  const parsed = recordSchema.parse({ ...record, published: true })
  const row = { ...parsed, published: record.published }
  return { row, content: row.content }
}

export function importDocument(text: string, current: EditorRecord): EditorRecord {
  const value: unknown = JSON.parse(text)
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Paste a content object or a full row object.')
  const fullRow = 'content' in value
  const candidate = fullRow ? value : { ...current, content: value }
  const published = fullRow && 'published' in value ? value.published : current.published
  if (typeof published !== 'boolean') throw new Error('published must be true or false.')
  // Content-only imports can be used before naming a new document. Temporary
  // names satisfy the public validator, then the user's original fields return.
  // A full row must supply its own valid title and slug; no fields are invented.
  const names = fullRow ? {} : { title: current.title || 'Untitled', slug: current.slug || 'untitled' }
  const parsed = recordSchema.parse({ ...candidate, ...names, published: true })
  return { ...parsed, title: fullRow ? parsed.title : current.title, slug: fullRow ? parsed.slug : current.slug, published }
}
