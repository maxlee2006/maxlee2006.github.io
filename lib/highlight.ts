import { bundledLanguages, codeToTokens } from 'shiki/bundle/full'

/** Shiki lazily loads the requested TextMate grammar and VS Code's Dark+ theme.
 * Unknown languages remain readable plain text instead of breaking an article.
 * Return tokens, not HTML: React safely escapes every piece of source code.
 */
export async function highlightCode(code: string, language = 'text') {
  const requested = language.toLowerCase()
  const lang = Object.prototype.hasOwnProperty.call(bundledLanguages, requested) ? requested as keyof typeof bundledLanguages : 'text'
  return (await codeToTokens(code, { lang, theme: 'dark-plus' })).tokens
}
