import Head from 'next/head'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import MediaModal from '../components/MediaModal'
import CategorySections from '../components/CategorySections'
import CmsStatus from '../components/CmsStatus'
import { useCatalog } from '../lib/cms/useCatalog'
import type { CmsRecord } from '../lib/cms/content'

export default function Design() {

  // Selection is temporary screen state, not a database edit. Closing a modal
  // clears this value; changing category only changes which loaded cards appear.
  const [selectedItem, setSelectedItem] = useState<CmsRecord | null>(null)

  const openModal = (item: CmsRecord) => { setSelectedItem(item) }

  // Keep this function stable across renders so MediaModal's effect doesn't
  // repeatedly tear down/recreate its focus and keyboard handling.
  const closeModal = useCallback(() => { setSelectedItem(null) }, [])
  // Fetch the shared catalog once per mounted page (with explicit retry).
  // CmsGrid below selects this page/category from those validated records.
  const { catalog, error, retry } = useCatalog()

  return (
    <>
      <Head>
        <title>Portfolio - Max Lee</title>
        <meta name="description" content="Max Lee's portfolio" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-5xl mx-auto px-5 pt-20 md:pt-5">
        
        {/* Static overlay */}

        <Link href="/"
        className="fixed left-0 md:-left-[-2rem] top-4 focus:bg-white focus:mx-10 md:top-0 h-24 md:h-full w-24 md:w-30 bg-gray-200 z-50 flex items-center justify-center transition-all duration-200 ease-linear md:hover:bg-white md:hover:mx-5 "
        >
          <div className="flex md:-rotate-90">
          <h1 className="text-black text-2xl md:text-6xl font-funnel">
          BACK
          </h1>
          </div>
        </Link>
        
        

        <div 
            className="fixed inset-0 -z-10 opacity-30"
            style={{
            backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px),
                repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)
            `,
            backgroundSize: '100% 100%',
            pointerEvents: 'none'
            }}
        ></div>
        
        {/*-------------------------------------------------------------------------------------*/}

        <h1 className="text-5xl mb-8 py-10 animate-slide-in-0.5s">Games</h1>
        {!catalog && <CmsStatus error={error} retry={retry} />}
        {catalog && <CategorySections catalog={catalog} page="design" onOpenModal={openModal} />}

        {/* Contact Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <h2 className="text-4xl mb-4">Contact</h2>
          <p className="mb-2">
            Email: <a href="mailto:max.lee82006@gmail.com" className="text-github-blue hover:underline">max.lee82006@gmail.com</a>
          </p>
          <p className="mb-2">
            <a href="https://github.com/maxlee2006" className="btn" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </p>
          <p className="mb-2">
            <a href="https://www.artstation.com/disputis545" className="btn" target="_blank" rel="noopener noreferrer">
              Artstation
            </a>
          </p>
        </div>


        <MediaModal item={selectedItem} onClose={closeModal} />
        
      </main>
    </>
  )
}

