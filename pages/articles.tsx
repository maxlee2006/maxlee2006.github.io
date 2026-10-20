import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ArticleView from '../components/ArticleView'
import CmsStatus from '../components/CmsStatus'
import GridItem from '../components/GridItem'
import { useCatalog } from '../lib/cms/useCatalog'

// GitHub Pages serves the same exported /articles page for every ?slug=value.
// After loading, the browser reads that query parameter and finds the matching
// published row. With no slug, this page lists all published articles.
// This is why a newly published article needs no route rebuild/deployment.
export default function Articles() {
  const router = useRouter()
  const { catalog, error, retry } = useCatalog()
  // Wait until Next.js has read the browser address as well as the catalog.
  if (!router.isReady || !catalog) return <main className="max-w-5xl mx-auto p-5"><CmsStatus error={error} retry={retry} /></main>
  const slug = router.query.slug
  if (slug !== undefined) {
    // Repeated ?slug parameters can produce an array; accept one string only.
    // Missing/unpublished records show a message. Static hosting still returns
    // HTTP 200 for this shell: we cannot send a dynamic server-side 404 here.
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
