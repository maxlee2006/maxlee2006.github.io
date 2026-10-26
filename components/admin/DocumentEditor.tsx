import { useEffect, useMemo, useState } from 'react'
import { exportDocument, importDocument, newDocument, placements, validateDocument, type EditorKind, type EditorRecord } from '../../lib/cms/editor'
import BlockEditor from './BlockEditor'
import { Field, GrowingText, TextField } from './Fields'
import DocumentPreview from './DocumentPreview'

export default function DocumentEditor() {
  const [record, setRecord] = useState<EditorRecord>(newDocument)
  const [kind, setKind] = useState<EditorKind>('Articles')
  const [tab, setTab] = useState<'preview' | 'json'>('preview')
  const [jsonScope, setJsonScope] = useState<'content' | 'row'>('content')
  const [message, setMessage] = useState('')
  const [importing, setImporting] = useState(false)
  const [importText, setImportText] = useState('')
  const [dirty, setDirty] = useState(false)

  // One state object is the source for the fields, document, preview, and JSON.
  // A change never inserts or updates a Supabase article/modal. Drafts stay in
  // memory; copy/export before leaving. Warn on accidental reload/tab closure.
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
  const validation = useMemo(() => validateDocument(record), [record])
  const output = validation.success ? exportDocument(record) : null
  const json = JSON.stringify(output ? output[jsonScope] : jsonScope === 'content' ? record.content : record, null, 2)

  async function copy(scope: 'row' | 'content') {
    if (!output) return
    const text = JSON.stringify(output[scope], null, 2)
    try {
      await navigator.clipboard.writeText(text)
      setMessage(scope === 'content' ? `Content JSON copied. Paste into the ${kind}.content cell.` : `Full row JSON copied for ${kind}.`)
    } catch {
      // Clipboard access can be denied by browser settings. Keep the exact text
      // visible and selectable, so copying manually always remains possible.
      setJsonScope(scope); setTab('json')
      setMessage('Clipboard access is unavailable. Select the JSON below and copy it manually.')
    }
  }

  function loadJson() {
    try {
      const next = importDocument(importText, record)
      if (dirty && !window.confirm('Replace this document with the imported JSON? Copy your current work first.')) return
      update(next); setImporting(false); setImportText(''); setMessage('JSON imported into this editor only.')
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
    <div className="admin-workspace-heading"><div><span className="admin-eyebrow">CONTENT STUDIO</span><h1>Make something worth sharing.</h1><p>Write. Preview. Copy your JSON when it’s ready.</p></div>
      <div className="admin-actions"><button type="button" onClick={() => setImporting(value => !value)}>Import JSON</button><button type="button" onClick={() => {
        if (!dirty || window.confirm('Start a new document? Copy your current work first.')) { setRecord(newDocument()); setDirty(false); setMessage('') }
      }}>New document</button></div>
    </div>
    <div className="admin-document-bar"><label>Format <select aria-label="Document format" value={kind} onChange={event => setKind(event.target.value as EditorKind)}><option value="Articles">Article</option><option value="Modals">Modal</option></select></label><span className="admin-local-status">● Local draft · copy to keep</span></div>
    {importing && <section className="admin-import" aria-label="Import JSON"><p>Paste a content object or full row from {kind}. Importing only changes this local document.</p><textarea aria-label="JSON to import" rows={7} value={importText} onChange={event => setImportText(event.target.value)} /><div className="admin-actions"><button type="button" onClick={loadJson}>Load JSON</button><button type="button" onClick={() => setImporting(false)}>Cancel</button></div></section>}
    <div className="admin-columns">
      <section className="admin-compose" aria-label="Document editor">
        <div className="admin-panel-title"><span>01 / COMPOSE</span><small>Plain text & media</small></div>
        <div className="admin-document">
          <GrowingText heading label="Document title" placeholder="Untitled project" value={record.title} onChange={title => update({ ...record, title })} />
          <details className="admin-details" open><summary>Placement & thumbnail <span>Required</span></summary><div className="admin-field-grid">
            <TextField label="Slug" value={record.slug} hint="Lowercase words separated by hyphens, e.g. my-project." onChange={slug => update({ ...record, slug })} />
            <TextField label="Thumbnail URL" value={record.content.thumbnail} hint="HTTPS URL or /assets/images/…" onChange={thumbnail => contentField('thumbnail', thumbnail)} />
            <Field label="Page"><select value={record.page} onChange={event => {
              const page = event.target.value as EditorRecord['page']
              update({ ...record, page, category: placements[page][0] })
            }}>{Object.keys(placements).map(page => <option key={page} value={page}>{page}</option>)}</select></Field>
            <Field label="Category"><select value={record.category} onChange={event => update({ ...record, category: event.target.value })}>{placements[record.page].map(category => <option key={category}>{category}</option>)}</select></Field>
            <Field label="Sort order"><input type="number" step={1} value={record.sort_order} onChange={event => update({ ...record, sort_order: Number(event.target.value) })} /></Field>
            <label className="admin-check"><input type="checkbox" checked={record.published} onChange={event => update({ ...record, published: event.target.checked })} />Published flag in exported row</label>
          </div></details>
          <details className="admin-details"><summary>Details & images <span>Optional</span></summary><div className="admin-field-grid">
            {metadataFields.map(({ key, label }) => <TextField key={key} label={label} multiline={key === 'description' || key === 'featured_description' || key === 'subtitle'} value={record.content[key] ?? ''} onChange={value => contentField(key, key.endsWith('_image') ? value || undefined : value)} />)}
            {/* Empty card overrides are meaningful: they deliberately hide the
                date/method on the card. A checkbox distinguishes empty from
                absent (absent inherits the main date/method). */}
            {(['card_date', 'card_method'] as const).map(key => <div key={key}>
              <label className="admin-check"><input type="checkbox" checked={record.content[key] !== undefined} onChange={event => contentField(key, event.target.checked ? '' : undefined)} />Override card {key === 'card_date' ? 'date' : 'method'}</label>
              {record.content[key] !== undefined && <TextField label={key === 'card_date' ? 'Card date' : 'Card method'} value={record.content[key] ?? ''} onChange={value => contentField(key, value)} hint="An empty override hides this text on the card." />}
            </div>)}
            <label className="admin-check"><input type="checkbox" checked={record.content.featured} onChange={event => contentField('featured', event.target.checked)} />Featured on home page (articles)</label>
          </div></details>
          <div className="admin-body-heading"><h2>Document body</h2><p>Add blocks anywhere. Use the arrows to change their order.</p></div>
          <BlockEditor body={record.content.body} onChange={body => contentField('body', body)} />
        </div>
      </section>
      <aside className="admin-review" aria-label="Preview and export">
        <div className="admin-panel-title"><span>02 / REVIEW</span><div className="admin-tabs"><button type="button" aria-pressed={tab === 'preview'} onClick={() => setTab('preview')}>Preview</button><button type="button" aria-pressed={tab === 'json'} onClick={() => setTab('json')}>JSON</button></div></div>
        {tab === 'preview' ? <DocumentPreview record={record} kind={kind} /> : <div className="admin-json"><Field label="JSON to display"><select value={jsonScope} onChange={event => setJsonScope(event.target.value as typeof jsonScope)}><option value="content">Content cell</option><option value="row">Full row</option></select></Field><textarea aria-label="Generated JSON" readOnly value={json} spellCheck={false} rows={24} /></div>}
        <div className="admin-export">
          {!validation.success ? <div className="admin-validation"><p>Complete these fields to export:</p><ul>{validation.error.issues.map((issue, index) => <li key={index}><strong>{issue.path.join('.')}</strong>: {issue.message}</li>)}</ul></div> : <p className="admin-valid">✓ JSON matches the website format</p>}
          <div className="admin-actions"><button type="button" className="admin-primary" disabled={!output} onClick={() => copy('content')}>Copy content JSON</button><button type="button" disabled={!output} onClick={() => copy('row')}>Copy full row</button></div>
          <p className="admin-footnote">Paste content JSON into the <code>content</code> cell of <strong>{kind}</strong>. Full row JSON also includes title, slug, placement, and the published flag. Nothing is saved to the database here.</p>
          {message && <p role="status" className="admin-message">{message}</p>}
        </div>
      </aside>
    </div>
  </main>
}
