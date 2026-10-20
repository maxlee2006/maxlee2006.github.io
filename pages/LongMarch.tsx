import ArticleView from '../components/ArticleView'
import CmsStatus from '../components/CmsStatus'
import { useCatalog } from '../lib/cms/useCatalog'
import Link from 'next/link'

// Keep existing /LongMarch bookmarks working while reading the same live row
// available through /articles?slug=long-march. No article content is stored here.
export default function LongMarch() {
  const { catalog, error, retry } = useCatalog()
  if (!catalog) return <main className="max-w-5xl mx-auto p-5"><CmsStatus error={error} retry={retry} /></main>
  const article = catalog.articles.find(item => item.slug === 'long-march')
  if (!article) return <main className="max-w-5xl mx-auto p-5"><p>This article is not available.</p><Link href="/">Back</Link></main>
  return <ArticleView article={article} />
}
