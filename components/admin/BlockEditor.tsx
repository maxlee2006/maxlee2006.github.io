import type { ContentBlock } from '../../lib/cms/content'
import { newBlock } from '../../lib/cms/editor'
import { Field, GrowingText, TextField } from './Fields'
import ButtonsEditor from './ButtonsEditor'

const blockNames: Record<ContentBlock['type'], string> = {
  paragraph: 'Paragraph', heading: 'Heading', image: 'Image', link: 'Link', code: 'Code sample', buttons: 'Button grid', embed: 'Embed', group: 'Group',
}

// Each insert control belongs to a position in the ordered body array. This is
// what allows paragraph → image → paragraph, rather than collecting all images
// at the end. Resetting the select lets the same type be inserted repeatedly.
function InsertBlock({ onInsert, depth }: { onInsert: (block: ContentBlock) => void; depth: number }) {
  return <label className="admin-insert"><span>＋</span><select aria-label="Insert block" value="" onChange={event => { if (event.target.value) onInsert(newBlock(event.target.value as ContentBlock['type'])) }}>
    <option value="">Add a block here</option>
    {Object.entries(blockNames).filter(([type]) => type !== 'group' || depth < 4).map(([type, name]) => <option key={type} value={type}>{name}</option>)}
  </select></label>
}

export default function BlockEditor({ body, onChange, depth = 0, path = 'body' }: { body: ContentBlock[]; onChange: (body: ContentBlock[]) => void; depth?: number; path?: string }) {
  // All edits create a new array. React then redraws both this editor and the
  // preview from the same state. No edit operation talks to the database.
  const insert = (at: number, block: ContentBlock) => onChange([...body.slice(0, at), block, ...body.slice(at)])
  const replace = (at: number, block: ContentBlock) => onChange(body.map((old, index) => index === at ? block : old))
  const move = (at: number, direction: number) => {
    const next = [...body]
    ;[next[at], next[at + direction]] = [next[at + direction], next[at]]
    onChange(next)
  }

  return <div className="admin-blocks">
    {body.length < 500 && <InsertBlock depth={depth} onInsert={block => insert(0, block)} />}
    {body.map((block, index) => {
      const label = `${path}.${index + 1}`
      return <div key={index}>
        <section className="admin-block" aria-label={`${blockNames[block.type]} block ${label}`}>
          <div className="admin-block-toolbar"><span>{String(index + 1).padStart(2, '0')} / {blockNames[block.type]}</span><div>
            <button type="button" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => move(index, -1)}>↑</button>
            <button type="button" aria-label={`Move ${label} down`} disabled={index === body.length - 1} onClick={() => move(index, 1)}>↓</button>
            <button type="button" aria-label={`Delete ${label}`} onClick={() => onChange(body.filter((_, at) => at !== index))}>Remove</button>
          </div></div>
          {block.type === 'paragraph' && <>
            <GrowingText label={`Paragraph ${label}`} value={block.text} placeholder="Write your paragraph…" onChange={text => replace(index, { ...block, text })} />
            <label className="admin-check"><input type="checkbox" checked={block.muted ?? false} onChange={event => replace(index, { ...block, muted: event.target.checked })} />Muted text (article)</label>
          </>}
          {block.type === 'heading' && <GrowingText heading label={`Heading ${label}`} value={block.text} placeholder="Section heading" onChange={text => replace(index, { ...block, text })} />}
          {block.type === 'image' && <div className="admin-field-grid">
            <TextField label="Image URL" value={block.src} placeholder="https://… or /assets/images/…" onChange={src => replace(index, { ...block, src })} />
            <TextField label="Alt text" value={block.alt} onChange={alt => replace(index, { ...block, alt })} />
            <TextField label="Caption" multiline value={block.caption ?? ''} onChange={caption => replace(index, { ...block, caption: caption || undefined })} />
          </div>}
          {block.type === 'link' && <div className="admin-field-grid">
            <TextField label="Link text" multiline value={block.text} onChange={text => replace(index, { ...block, text })} />
            <TextField label="Link URL" value={block.href} onChange={href => replace(index, { ...block, href })} />
          </div>}
          {block.type === 'code' && <>
            <div className="admin-field-grid">
              <TextField label="Code language" value={block.language ?? ''} placeholder="cpp, javascript, python, text…" hint="Leave empty for plain text." onChange={language => replace(index, { ...block, language: language || undefined })} />
              <TextField label="Code filename (optional)" value={block.filename ?? ''} placeholder="main.cpp" onChange={filename => replace(index, { ...block, filename: filename || undefined })} />
            </div>
            <Field label="Source code"><textarea className="admin-code-input" rows={10} maxLength={100000} spellCheck={false} autoCapitalize="none" autoCorrect="off" wrap="off" value={block.code} placeholder="Paste or write your code…" onChange={event => replace(index, { ...block, code: event.target.value })} /></Field>
          </>}
          {block.type === 'buttons' && <ButtonsEditor buttons={block.buttons} onChange={buttons => replace(index, { ...block, buttons })} />}
          {block.type === 'embed' && <div className="admin-field-grid">
            <TextField label="Embed URL" value={block.src} placeholder="https://www.youtube.com/embed/…" onChange={src => replace(index, { ...block, src })} />
            <TextField label="Embed title" value={block.title} onChange={title => replace(index, { ...block, title })} />
            <Field label="Embed height (px)"><input type="number" min={100} max={1000} placeholder="Auto" value={block.height ?? ''} onChange={event => replace(index, { ...block, height: event.target.value === '' ? undefined : Number(event.target.value) })} /></Field>
          </div>}
          {block.type === 'group' && <>
            <Field label="Group layout"><select value={block.layout} onChange={event => replace(index, { ...block, layout: event.target.value as typeof block.layout })}>
              <option value="text">Text</option><option value="embeds">Embeds</option><option value="gallery">Gallery</option>
            </select></Field>
            <BlockEditor body={block.body} depth={depth + 1} path={label} onChange={nested => replace(index, { ...block, body: nested })} />
          </>}
        </section>
        {body.length < 500 && <InsertBlock depth={depth} onInsert={newItem => insert(index + 1, newItem)} />}
      </div>
    })}
    {body.length >= 500 && <p className="admin-error">This section has reached the 500-block limit.</p>}
  </div>
}
