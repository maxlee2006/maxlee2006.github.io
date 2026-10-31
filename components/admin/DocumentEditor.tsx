import { useEffect, useMemo, useRef, useState } from 'react'
import { exportDocument, importDocument, newDocument, validateDocument, type EditorKind, type EditorRecord } from '../../lib/cms/editor'
import { pages, type Category } from '../../lib/cms/content'
import { readCategories } from '../../lib/cms/categories'
import { readSavedDocuments, saveDocument } from '../../lib/cms/admin'
import BlockEditor from './BlockEditor'
import { Field, GrowingText, TextField } from './Fields'
import DocumentPreview from './DocumentPreview'
import CategoryManager from './CategoryManager'

export default function DocumentEditor() {
  const [record, setRecord] = useState<EditorRecord>(newDocument)
  const [kind, setKind] = useState<EditorKind>('Articles')
  const [tab, setTab] = useState<'preview' | 'json'>('preview')
  const [jsonScope, setJsonScope] = useState<'content' | 'row'>('content')
  const [message, setMessage] = useState('')
  const [importing, setImporting] = useState(false)
  const [importText, setImportText] = useState('')
  const [dirty, setDirty] = useState(false)
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [categoryError, setCategoryError] = useState('')
  const [savedDocuments, setSavedDocuments] = useState<EditorRecord[]>([])
  const [saved, setSaved] = useState<{ kind: EditorKind; slug: string } | null>(null)
  const [listError, setListError] = useState('')
  const [refresh, setRefresh] = useState(0)
  const [saving, setSaving] = useState(false)
  const [creatingCategory, setCreatingCategory] = useState(false)
  const busy = saving || creatingCategory
  const savingRef = useRef(false)

  useEffect(() => {
    let active = true
    setCategoryError('')
    readCategories().then(rows => { if (active) setCategories(rows) }).catch(() => {
      if (active) setCategoryError('Could not load categories. Try again before saving.')
    })
    return () => { active = false }
  }, [refresh])
  useEffect(() => {
    let active = true
    setSavedDocuments([]); setListError('')
    readSavedDocuments(kind).then(rows => { if (active) setSavedDocuments(rows) }).catch(error => {
      if (active) setListError(error instanceof Error ? error.message : 'Could not load documents.')
    })
    return () => { active = false }
  }, [kind, refresh])

  // One state object is the source for the fields, document, preview, and JSON.
  // Typing changes only local state. Only the explicit Save button writes.
  const update = (next: EditorRecord) => { setRecord(next); setDirty(true); setMessage('') }
  const contentField = <K extends keyof EditorRecord['content']>(key: K, value: EditorRecord['content'][K]) => update({ ...record, content: { ...record.content, [key]: value } })
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  // The existing schema checks URLs, placements, integer values, block depth,
  // and all required fields. Invalid JSON can be inspected but cannot be copied
  // with the export buttons until these checks pass.
  const validation = useMemo(() => validateDocument(record, categories ?? undefined), [record, categories])
  const output = validation.success ? exportDocument(record) : null
  const json = JSON.stringify(output ? output[jsonScope] : jsonScope === 'content' ? record.content : record, null, 2)

  async function save() {
    if (!output || !categories || creatingCategory || savingRef.current) return
    savingRef.current = true; setSaving(true); setMessage('')
    try {
      const row = await saveDocument(kind, record, saved?.kind === kind ? saved.slug : undefined)
      setRecord(row); setSaved({ kind, slug: row.slug }); setDirty(false)
      setMessage(`${kind === 'Articles' ? 'Article' : 'Modal'} saved${row.published ? ' and published' : ' as a draft'}.`)
      setRefresh(value => value + 1)
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save. Your changes are still in the editor.') }
    finally { savingRef.current = false; setSaving(false) }
  }

  async function copy(scope: 'row' | 'content') {
    if (!output) return
    const text = JSON.stringify(output[scope], null, 2)
    try {
      await navigator.clipboard.writeText(text)
      setMessage(scope === 'content' ? 'Content JSON copied.' : 'Full row JSON copied.')
    } catch {
      // Clipboard access can be denied by browser settings. Keep the exact text
      // visible and selectable, so copying manually always remains possible.
      setJsonScope(scope); setTab('json')
      setMessage('Clipboard access is unavailable. Select the JSON below and copy it manually.')
    }
  }

  function loadJson() {
    if (busy) return
    try {
      const next = importDocument(importText, record)
      if (dirty && !window.confirm('Replace this document with the imported JSON? Copy your current work first.')) return
      update(next); setSaved(null); setImporting(false); setImportText(''); setMessage('JSON imported as a new document.')
    } catch (err) {
      // Zod errors can contain long nested details; keep them readable here.
      setMessage(err instanceof Error ? `Could not import: ${err.message}` : 'Could not import JSON.')
    }
  }

  const metadataFields: { key: 'date' | 'method' | 'subtitle' | 'description' | 'hero_image' | 'logo_image' | 'featured_image' | 'featured_description'; label: string }[] = [
    { key: 'date', label: 'Date / role' }, { key: 'method', label: 'Method / tools' },
    { key: 'subtitle', label: 'Subtitle' }, { key: 'description', label: 'Description (page metadata)' },
    { key: 'hero_image', label: 'Hero image URL' }, { key: 'logo_image', label: 'Logo image URL' },
    { key: 'featured_image', label: 'Featured image URL' }, { key: 'featured_description', label: 'Featured description' },
  ]

  return <main className="admin-workspace">
    <div className="admin-workspace-heading"><h1>Admin</h1>
      <div className="admin-actions"><button type="button" disabled={busy} onClick={() => setImporting(value => !value)}>Import JSON</button><button type="button" disabled={busy} onClick={() => {
        if (!dirty || window.confirm('Start a new document? Save or copy your current work first.')) { setRecord(newDocument()); setSaved(null); setDirty(false); setMessage('') }
      }}>New document</button></div>
    </div>
    <div className="admin-document-bar"><label>Format <select aria-label="Document format" disabled={busy} value={kind} onChange={event => { setKind(event.target.value as EditorKind); if (saved) setDirty(true); setSaved(null) }}><option value="Articles">Article</option><option value="Modals">Modal</option></select></label><span className="admin-local-status">{saving ? 'Saving…' : dirty ? 'Unsaved changes' : saved ? 'Saved' : 'New document'}</span></div>
    <div className="admin-saved-documents">
      <Field label="Open saved document"><select disabled={busy} value={saved?.kind === kind ? saved.slug : ''} onChange={event => {
        const next = savedDocuments.find(row => row.slug === event.target.value)
        if (next && (!dirty || window.confirm('Open this document? Save or copy your current changes first.'))) {
          setRecord(next); setSaved({ kind, slug: next.slug }); setDirty(false); setMessage('')
        }
      }}><option value="">Choose a saved {kind === 'Articles' ? 'article' : 'modal'}</option>{savedDocuments.map(row => <option key={row.slug} value={row.slug}>{row.title} ({row.published ? 'Published' : 'Draft'})</option>)}</select></Field>
      <button type="button" disabled={busy} onClick={() => setRefresh(value => value + 1)}>Refresh saved content</button>
    </div>
    {(categoryError || listError) && <p role="alert" className="admin-error">{categoryError || listError}</p>}
    {importing && <section className="admin-import" aria-label="Import JSON"><textarea disabled={busy} aria-label="JSON to import" placeholder="Paste content JSON or a full row" rows={7} value={importText} onChange={event => setImportText(event.target.value)} /><div className="admin-actions"><button type="button" disabled={busy} onClick={loadJson}>Load JSON</button><button type="button" disabled={busy} onClick={() => setImporting(false)}>Cancel</button></div></section>}
    <div className="admin-columns">
      <section className="admin-compose" aria-label="Document editor">
        <div className="admin-panel-title"><h2>Editor</h2></div>
        <fieldset className="admin-document" disabled={busy}>
          <GrowingText heading label="Document title" placeholder="Untitled project" value={record.title} onChange={title => update({ ...record, title })} />
          <details className="admin-details" open><summary>Placement & thumbnail</summary><div className="admin-field-grid">
            <TextField label="Slug" value={record.slug} placeholder="my-project" onChange={slug => update({ ...record, slug })} />
            <TextField label="Thumbnail URL" value={record.content.thumbnail} placeholder="https://… or /assets/images/…" onChange={thumbnail => contentField('thumbnail', thumbnail)} />
            <Field label="Page"><select value={record.page} onChange={event => {
              const page = event.target.value as EditorRecord['page']
              update({ ...record, page, category: categories?.find(category => category.page === page)?.slug ?? '' })
            }}>{pages.map(page => <option key={page} value={page}>{page}</option>)}</select></Field>
            <Field label="Category"><select value={record.category} onChange={event => update({ ...record, category: event.target.value })}>
              {!categories?.some(category => category.page === record.page && category.slug === record.category) && <option value={record.category}>{record.category || 'Create a category first'}</option>}
              {categories?.filter(category => category.page === record.page).map(category => <option key={category.slug} value={category.slug}>{category.title}</option>)}
            </select></Field>
            <Field label="Sort order"><input type="number" step={1} value={record.sort_order} onChange={event => update({ ...record, sort_order: Number(event.target.value) })} /></Field>
            <label className="admin-check"><input type="checkbox" checked={record.published} onChange={event => update({ ...record, published: event.target.checked })} />Published</label>
          </div></details>
          {categories && <CategoryManager key={record.page} page={record.page} categories={categories} onBusyChange={setCreatingCategory} onCreated={category => {
            setCategories(current => [...(current ?? []), category].sort((a, b) => a.sort_order - b.sort_order || a.slug.localeCompare(b.slug)))
            update({ ...record, page: category.page, category: category.slug })
          }} />}
          <details className="admin-details"><summary>Details & images</summary><div className="admin-field-grid">
            {metadataFields.map(({ key, label }) => <TextField key={key} label={label} multiline={key === 'description' || key === 'featured_description' || key === 'subtitle'} value={record.content[key] ?? ''} onChange={value => contentField(key, key.endsWith('_image') ? value || undefined : value)} />)}
            {/* Empty card overrides are meaningful: they deliberately hide the
                date/method on the card. A checkbox distinguishes empty from
                absent (absent inherits the main date/method). */}
            {(['card_date', 'card_method'] as const).map(key => <div key={key}>
              <label className="admin-check"><input type="checkbox" checked={record.content[key] !== undefined} onChange={event => contentField(key, event.target.checked ? '' : undefined)} />Override card {key === 'card_date' ? 'date' : 'method'}</label>
              {record.content[key] !== undefined && <TextField label={key === 'card_date' ? 'Card date' : 'Card method'} value={record.content[key] ?? ''} onChange={value => contentField(key, value)} />}
            </div>)}
            <label className="admin-check"><input type="checkbox" checked={record.content.featured} onChange={event => contentField('featured', event.target.checked)} />Featured on home page (articles)</label>
          </div></details>
          <div className="admin-body-heading"><h2>Body</h2></div>
          <BlockEditor body={record.content.body} onChange={body => contentField('body', body)} />
        </fieldset>
      </section>
      <aside className="admin-review" aria-label="Preview and export">
        <div className="admin-panel-title"><h2>Output</h2><div className="admin-tabs"><button type="button" aria-pressed={tab === 'preview'} onClick={() => setTab('preview')}>Preview</button><button type="button" aria-pressed={tab === 'json'} onClick={() => setTab('json')}>JSON</button></div></div>
        {tab === 'preview' ? <DocumentPreview record={record} kind={kind} /> : <div className="admin-json"><Field label="JSON to display"><select value={jsonScope} onChange={event => setJsonScope(event.target.value as typeof jsonScope)}><option value="content">Content cell</option><option value="row">Full row</option></select></Field><textarea aria-label="Generated JSON" readOnly value={json} spellCheck={false} rows={24} /></div>}
        <div className="admin-export">
          {!validation.success && <div className="admin-validation"><p>Required fields:</p><ul>{validation.error.issues.map((issue, index) => <li key={index}><strong>{issue.path.join('.')}</strong>: {issue.message}</li>)}</ul></div>}
          <div className="admin-actions"><button type="button" className="admin-primary" disabled={!output || !categories || !!categoryError || busy || (!dirty && !!saved)} onClick={save}>{saving ? 'Saving…' : `Save ${kind === 'Articles' ? 'article' : 'modal'}`}</button><button type="button" disabled={!output || busy} onClick={() => copy('content')}>Copy content JSON</button><button type="button" disabled={!output || busy} onClick={() => copy('row')}>Copy full row</button></div>
          {message && <p role="status" className="admin-message">{message}</p>}
        </div>
      </aside>
    </div>
  </main>
}
