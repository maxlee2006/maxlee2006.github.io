import type { ContentButton } from '../../lib/cms/content'
import { Field, TextField } from './Fields'

type Props = { buttons: ContentButton[]; onChange: (buttons: ContentButton[]) => void }

export default function ButtonsEditor({ buttons, onChange }: Props) {
  const replace = (at: number, button: ContentButton) => onChange(buttons.map((old, index) => index === at ? button : old))
  const move = (at: number, direction: number) => {
    const next = [...buttons]
    ;[next[at], next[at + direction]] = [next[at + direction], next[at]]
    onChange(next)
  }
  return <div className="admin-button-list">
    {buttons.map((button, index) => <fieldset key={index} className="admin-button-entry">
      <legend>Button {index + 1}</legend>
      <div className="admin-block-toolbar"><span /><div>
        <button type="button" aria-label={`Move button ${index + 1} up`} disabled={index === 0} onClick={() => move(index, -1)}>↑</button>
        <button type="button" aria-label={`Move button ${index + 1} down`} disabled={index === buttons.length - 1} onClick={() => move(index, 1)}>↓</button>
        <button type="button" aria-label={`Remove button ${index + 1}`} onClick={() => onChange(buttons.filter((_, at) => at !== index))}>Remove</button>
      </div></div>
      <div className="admin-field-grid">
        <TextField label="Button text" value={button.text} onChange={text => replace(index, { ...button, text })} />
        <Field label="Destination type"><select value={button.article !== undefined ? 'article' : 'url'} onChange={event => {
          // Replacing the destination discards the other field so exports can
          // never contain both article and href after changing the selection.
          const shared = { text: button.text, image: button.image }
          replace(index, event.target.value === 'article' ? { ...shared, article: '' } : { ...shared, href: '' })
        }}><option value="url">Website or site path</option><option value="article">Article</option></select></Field>
        {button.article !== undefined
          ? <TextField label="Article slug" value={button.article} placeholder="long-march" onChange={article => replace(index, { ...button, article })} />
          : <TextField label="Link URL" value={button.href} placeholder="https://… or /articles" onChange={href => replace(index, { ...button, href })} />}
        <TextField label="Button image URL (optional)" value={button.image ?? ''} placeholder="https://… or /assets/images/…" hint="Leave empty for a black button." onChange={image => replace(index, { ...button, image: image || undefined })} />
      </div>
    </fieldset>)}
    <button type="button" disabled={buttons.length >= 100} onClick={() => onChange([...buttons, { text: '', href: '' }])}>Add button</button>
    {buttons.length === 0 && <p className="admin-error">Add at least one button to this grid.</p>}
    {buttons.length >= 100 && <p className="admin-error">This grid has reached the 100-button limit.</p>}
  </div>
}
