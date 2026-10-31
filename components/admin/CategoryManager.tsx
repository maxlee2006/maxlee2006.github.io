import { useState, type FormEvent } from 'react'
import { createCategory } from '../../lib/cms/admin'
import { categorySchema, pages, type Category } from '../../lib/cms/content'
import { Field, TextField } from './Fields'

export default function CategoryManager({ page, categories, onCreated, onBusyChange }: { page: Category['page']; categories: Category[]; onCreated: (category: Category) => void; onBusyChange: (busy: boolean) => void }) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [image, setImage] = useState('')
  const [targetPage, setTargetPage] = useState<Category['page']>(page)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    const parsed = categorySchema.safeParse({ page: targetPage, slug, title, image: image || undefined,
      sort_order: Math.max(-1, ...categories.filter(category => category.page === targetPage).map(category => category.sort_order)) + 1,
      columns: targetPage === 'portfolio' ? 3 : 2,
    })
    if (!parsed.success) { setMessage(parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('\n')); return }
    setBusy(true); onBusyChange(true); setMessage('')
    try {
      const category = await createCategory(parsed.data)
      onCreated(category); setTitle(''); setSlug(''); setImage(''); setSlugEdited(false)
      setMessage(`Created ${category.title}. It is now selected for this document.`)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not create category. Please try again.') }
    finally { setBusy(false); onBusyChange(false) }
  }
  return <details className="admin-details"><summary>Create category</summary>
    <form onSubmit={submit} aria-label="Create category"><fieldset disabled={busy}>
      <div className="admin-field-grid">
        <Field label="Category page"><select value={targetPage} onChange={event => setTargetPage(event.target.value as Category['page'])}>{pages.map(value => <option key={value}>{value}</option>)}</select></Field>
        <TextField label="Category name" value={title} onChange={value => {
          setTitle(value)
          if (!slugEdited) setSlug(value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
        }} />
        <TextField label="Category slug" value={slug} placeholder="new-category" onChange={value => { setSlugEdited(true); setSlug(value) }} />
        <TextField label="Category image URL (optional)" value={image} onChange={setImage} />
      </div>
      <button type="submit">{busy ? 'Creating…' : 'Create category'}</button>
    </fieldset></form>
    {message && <p role="status" className="admin-message">{message}</p>}
  </details>
}
