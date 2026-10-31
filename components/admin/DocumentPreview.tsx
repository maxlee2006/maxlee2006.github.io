import { useEffect, useState } from 'react'
import ArticleView from '../ArticleView'
import { ModalContent } from '../MediaModal'
import GridItem from '../GridItem'
import { isSafeUrl, type CmsRecord } from '../../lib/cms/content'
import { previewBlocks, type EditorKind, type EditorRecord } from '../../lib/cms/editor'

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
    <div className="admin-preview-tools"><label>View <select aria-label="Preview view" value={view} onChange={event => setView(event.target.value as typeof view)}><option value="document">{kind === 'Articles' ? 'Article' : 'Modal'}</option><option value="card">Project card</option>{kind === 'Articles' && <option value="featured">Home feature</option>}</select></label></div>
    <div className="admin-site-preview" aria-label="Live website preview" onClickCapture={event => {
      // Inspecting a link in a draft must not navigate away and discard edits.
      if ((event.target as HTMLElement).closest('a')) event.preventDefault()
    }}>
      {(view === 'document' || (view === 'featured' && kind === 'Modals')) && (kind === 'Articles' ? <ArticleView article={item} preview /> : <div className="bg-black/80 p-4"><div className="relative bg-black/90 p-6"><span className="absolute right-4 top-3 text-3xl" aria-hidden="true">×</span><ModalContent item={item} /></div></div>)}
      {view === 'card' && <div className="admin-card-preview" onClick={event => event.preventDefault()}>{isSafeUrl(item.content.thumbnail) ? <GridItem data={item} article={kind === 'Articles'} /> : <p>Add a valid thumbnail URL to preview the project card.</p>}</div>}
      {view === 'featured' && kind === 'Articles' && <div className="relative min-h-[20rem] flex flex-col justify-end px-6 py-10 text-right" style={{ backgroundImage: safeImage(item.content.featured_image ?? item.content.thumbnail) ? `url("${item.content.featured_image ?? item.content.thumbnail}")` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}><div className="absolute inset-0 bg-black/80" /><div className="relative"><p className="text-xl uppercase tracking-wide text-gray-300">Featured Project</p><h1 className="text-3xl font-semibold text-white">{item.title}</h1><p className="mt-2 text-xl text-gray-400">{item.content.featured_description}</p></div></div>}
    </div>
  </div>
}
