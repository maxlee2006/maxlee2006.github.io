import { useEffect, useRef, type ReactNode } from 'react'

// Wrapping the control in its label makes every field keyboard/screen-reader
// accessible without needing to invent a unique HTML id for nested blocks.
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="admin-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}

export function TextField({ label, value, onChange, hint, placeholder, multiline = false }: { label: string; value: string; onChange: (value: string) => void; hint?: string; placeholder?: string; multiline?: boolean }) {
  return <Field label={label} hint={hint}>{multiline ? <textarea rows={3} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} /> : <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} />}</Field>
}

// Textareas preserve plain text and line breaks, which is exactly what the CMS
// stores. Growing with their content makes paragraphs feel like a document.
// We never use innerHTML/contentEditable, so pasted HTML cannot become scripts.
export function GrowingText({ label, value, onChange, placeholder, heading = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; heading?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const area = ref.current
    if (area) { area.style.height = 'auto'; area.style.height = `${area.scrollHeight}px` }
  }, [value])
  return <textarea ref={ref} aria-label={label} rows={heading ? 1 : 2} className={`admin-writing ${heading ? 'admin-writing-heading' : ''}`} value={value} placeholder={placeholder} onChange={event => onChange(event.target.value)} />
}
