import { useEffect, useState } from 'react'
import ArticleView from '../ArticleView'
import { ModalContent } from '../MediaModal'
import GridItem from '../GridItem'
import { isSafeEmbed, isSafeUrl, type CmsRecord, type ContentBlock } from '../../lib/cms/content'
import type { EditorKind, EditorRecord } from '../../lib/cms/editor'

// Incomplete fields are normal while typing. Show valid text immediately, but
// never send an incomplete/unsafe media address to the browser. This temporary
// filtering is for preview only: export still validates the entire document,
// so nothing can silently disappear from the JSON somebody copies.
function previewBlocks(body: ContentBlock[]): ContentBlock[] {
  return body.flatMap<ContentBlock>(block => {
    if (block.type === 'group') return [{ ...block, body: previewBlocks(block.body) }]
    if (block.type === 'image' && !isSafeUrl(block.src)) return []
    if (block.type === 'link' && !isSafeUrl(block.href)) return []
    if (block.type === 'embed') {
      if (!isSafeEmbed(block.src)) return []
      return [{ ...block, height: block.height && Number.isInteger(block.height) && block.height >= 100 && block.height <= 1000 ? block.height : undefined }]
    }
    return [block]
  })
}

export default function DocumentPreview({ record, kind }: { record: EditorRecord; kind: EditorKind }) {
  const [view, setView] = useState<'document' | 'card' | 'featured'>('document')
  // A modal has no home-feature view. Returning to the document on a format
  // change keeps the visible selector and preview in agreement.
  useEffect(() => { setView('document') }, [kind])
  const safeImage = (value?: string) => value && isSafeUrl(value) ? value : undefined
  const item: CmsRecord = {
    ...record, published: true, title: record.title || 'Untitled project',
    content: {
      ...record.content, hero_image: safeImage(record.content.hero_image),
      logo_image: safeImage(record.content.logo_image), featured_image: safeImage(record.content.featured_image),
      body: previewBlocks(record.content.body),
    },
  }

  return <div className="admin-preview-wrap">
    <div className="admin-preview-tools"><label>Show <select aria-label="Preview view" value={view} onChange={event => setView(event.target.value as typeof view)}><option value="document">{kind === 'Articles' ? 'Article' : 'Modal'}</option><option value="card">Project card</option>{kind === 'Articles' && <option value="featured">Home feature</option>}</select></label><span>Live preview</span></div>
    <div className="admin-site-preview" aria-label="Live website preview">
      {(view === 'document' || (view === 'featured' && kind === 'Modals')) && (kind === 'Articles' ? <ArticleView article={item} preview /> : <div className="bg-black/80 p-4"><div className="relative bg-black/90 p-6"><span className="absolute right-4 top-3 text-3xl" aria-hidden="true">×</span><ModalContent item={item} /></div></div>)}
      {view === 'card' && <div className="admin-card-preview" onClick={event => event.preventDefault()}>{isSafeUrl(item.content.thumbnail) ? <GridItem data={item} article={kind === 'Articles'} /> : <p>Add a valid thumbnail URL to preview the project card.</p>}</div>}
      {view === 'featured' && kind === 'Articles' && <div className="relative min-h-[20rem] flex flex-col justify-end px-6 py-10 text-right" style={{ backgroundImage: safeImage(item.content.featured_image ?? item.content.thumbnail) ? `url("${item.content.featured_image ?? item.content.thumbnail}")` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}><div className="absolute inset-0 bg-black/80" /><div className="relative"><p className="text-xl uppercase tracking-wide text-gray-300">Featured Project</p><h1 className="text-3xl font-semibold text-white">{item.title}</h1><p className="mt-2 text-xl text-gray-400">{item.content.featured_description}</p></div></div>}
    </div>
    <p className="admin-preview-note">Uses the website’s article, modal, and card renderers. Preview is scaled to this panel. Incomplete media URLs stay hidden until valid.</p>
  </div>
}
