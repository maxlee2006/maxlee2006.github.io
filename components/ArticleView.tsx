import Head from 'next/head'
import Link from 'next/link'
import ContentBody from './ContentBody'
import type { CmsRecord } from '../lib/cms/content'

// Presentation only: routes choose an article after loading the catalog.
// Reuse the original LongMarch layout for every article. Hero/logo metadata is
// optional; ContentBody handles ordered text/media. Head updates browser metadata
// after loading, so this isn't server-rendered article text for search crawlers.
// The Admin preview reuses this component, hiding only page-level navigation
// and metadata. The actual title, hero, text, and body stay in one renderer.
export default function ArticleView({ article, preview = false }: { article: CmsRecord; preview?: boolean }) {
  const { content } = article
  // A preview lives inside Admin's main landmark, so avoid nesting <main> tags.
  const Container = preview ? 'div' : 'main'
  return <>
    {!preview && <Head>
      <title>{article.title}</title>
      <meta name="description" content={content.description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>}
    <Container className={preview ? 'max-w-5xl mx-auto px-5 py-6' : 'max-w-5xl mx-auto px-5 pt-20 md:pt-5 pb-16'}>
        {!preview && <Link href="/"
        className="fixed left-0 md:-left-[-2rem] top-4 focus:bg-white focus:mx-10 md:top-0 h-24 md:h-full w-24 md:w-30 bg-gray-200 z-50 flex items-center justify-center transition-all duration-200 ease-linear md:hover:bg-white md:hover:mx-5 "
        >
          <div className="flex md:-rotate-90">
          <h1 className="text-black text-2xl md:text-6xl font-funnel">
          BACK
          </h1>
          </div>
        </Link>}

        {!preview && <div
            className="fixed inset-0 -z-10 opacity-30"
            style={{
            backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px),
                repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)
            `,
            backgroundSize: '100% 100%',
            pointerEvents: 'none'
            }}
        ></div>}


      {content.hero_image ? <div
        className="relative w-full h-60 md:h-80 mb-8 overflow-hidden border-b border-white animate-slide-in-0.6s"
        style={{ backgroundImage: `url("${content.hero_image}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {content.logo_image && <img src={content.logo_image} alt={article.title} className="absolute inset-y-0 left-0 bottom-8 py-3 z-10 h-60 w-auto object-contain pointer-events-none" />}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 h-full flex flex-col justify-end alignment-right px-6 py-5">
          {!content.logo_image && <h1 className="text-3xl mb-2">{article.title}</h1>}
          <p className="text-2xl uppercase tracking-wide text-gray-100">{content.subtitle}</p>
          <p className="mt-1 text-xl text-gray-300">{content.date}</p>
        </div>
      </div> : <header className="mb-8"><h1 className="text-3xl">{article.title}</h1><p>{content.subtitle}</p><p className="text-gray-400">{content.date}</p></header>}
      <article aria-label={article.title}>
        <ContentBody body={content.body} variant="article" />
      </article>
    </Container>
  </>
}
