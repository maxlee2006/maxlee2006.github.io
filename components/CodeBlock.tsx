import { Fragment, useEffect, useState } from 'react'
import type { ThemedToken } from 'shiki'

type Props = { code: string; language?: string; filename?: string }

export default function CodeBlock({ code, language = 'text', filename }: Props) {
  const [highlighted, setHighlighted] = useState<{ code: string; language: string; tokens: ThemedToken[][] }>()
  useEffect(() => {
    let active = true
    // Keep the highlighter off pages without code. Plain text is visible while
    // it loads and remains available if loading fails. Ignore stale results.
    import('../lib/highlight').then(({ highlightCode }) => highlightCode(code, language))
      .then(tokens => { if (active) setHighlighted({ code, language, tokens }) })
      .catch(() => { if (active) setHighlighted(undefined) })
    return () => { active = false }
  }, [code, language])
  const tokens = highlighted?.code === code && highlighted.language === language ? highlighted.tokens : undefined
  return <div className="code-block">
    <div className="code-block-header">
      <span className="min-w-0 break-all">{filename || language}</span>
      {filename && <span className="shrink-0 text-gray-400">{language}</span>}
    </div>
    <pre tabIndex={0} aria-label={filename ? `Code sample: ${filename}` : `${language} code sample`}>
      <code>{tokens ? tokens.map((line, index) => <Fragment key={index}>
        {index > 0 && '\n'}{line.map((token, tokenIndex) => <span key={tokenIndex} style={{ color: token.color, fontStyle: token.fontStyle && token.fontStyle & 1 ? 'italic' : undefined, fontWeight: token.fontStyle && token.fontStyle & 2 ? 'bold' : undefined, textDecoration: token.fontStyle && token.fontStyle & 4 ? 'underline' : undefined }}>{token.content}</span>)}
      </Fragment>) : code}</code>
    </pre>
  </div>
}
