import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ArticleView from '../components/ArticleView'
import CmsStatus from '../components/CmsStatus'
import GridItem from '../components/GridItem'
import { useCatalog } from '../lib/cms/useCatalog'

// A query-based route works on GitHub Pages without a server or per-slug rebuild.
export default function Articles() {
  const router = useRouter()
  const { catalog, error, retry } = useCatalog()
  if (!router.isReady || !catalog) return <main className="max-w-5xl mx-auto p-5"><CmsStatus error={error} retry={retry} /></main>
  const slug = router.query.slug
  if (slug !== undefined) {
    const article = typeof slug === 'string' ? catalog.articles.find(item => item.slug === slug) : undefined
    return article ? <ArticleView article={article} /> : <main className="max-w-5xl mx-auto p-5"><h1>Article unavailable</h1><p>This article may be unpublished or the address may be incorrect.</p><Link href="/articles">All articles</Link></main>
  }
  return <>
    <Head><title>Articles - Max Lee</title></Head>
    <main className="max-w-5xl mx-auto p-5">
      <Link href="/">Back</Link><h1 className="text-5xl my-8">Articles</h1>
      {catalog.articles.length ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">{catalog.articles.map(article => <GridItem key={article.slug} data={article} article />)}</div> : <p>No published articles yet.</p>}
    </main>
  </>
}
