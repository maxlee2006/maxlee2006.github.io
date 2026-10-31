import Head from 'next/head'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import MediaModal from '../components/MediaModal'
import CategorySections from '../components/CategorySections'
import CmsStatus from '../components/CmsStatus'
import { useCatalog } from '../lib/cms/useCatalog'
import type { CmsRecord } from '../lib/cms/content'

export default function Professional() {
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
        <meta name="description" content="Max Lee's professional projects" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-5xl mx-auto px-5 pt-20 md:pt-5">


        {/* Static overlay */}

        <Link href="/"
        className="fixed left-0 lg:-left-[-2rem] top-4 focus:bg-white focus:mx-10 md:top-0 h-24 lg:h-full w-24 lg:w-30 bg-gray-200 z-50 flex items-center justify-center transition-all duration-200 ease-linear lg:hover:bg-white lg:hover:mx-5 "
        >
          <div className="flex lg:-rotate-90">
          <h1 className="text-black text-2xl lg:text-6xl font-funnel">
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


        <h1 className="text-4xl mb-8 py-10 animate-slide-in-0.5s">Professional Projects</h1>
        {!catalog && <CmsStatus error={error} retry={retry} />}
        {catalog && <CategorySections catalog={catalog} page="professional-projects" onOpenModal={openModal} />}

{/*-----------------------------------------Contact Info--------------------------------------------*/}

        <h2 className="text-4xl mt-6 mb-2 pb-1 border-b border-gray-200">Contact</h2>
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

        <MediaModal item={selectedItem} onClose={closeModal} />
      </main>
    </>
  )
}

