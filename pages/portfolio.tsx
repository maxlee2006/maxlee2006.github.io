import Head from 'next/head'
import Link from 'next/link'
import { useCallback, useState } from 'react'

import MediaModal from '../components/MediaModal'
import CmsGrid from '../components/CmsGrid'
import CmsStatus from '../components/CmsStatus'
import { useCatalog } from '../lib/cms/useCatalog'
import type { CmsRecord } from '../lib/cms/content'

export default function Portfolio() {
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<CmsRecord | null>(null)

  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category)
  }

  const openModal = (item: CmsRecord) => { setSelectedItem(item) }

  const closeModal = useCallback(() => { setSelectedItem(null) }, [])
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


        <h1 className="text-5xl mb-8 py-10 animate-slide-in-0.5s">ART</h1>
        {!catalog && <CmsStatus error={error} retry={retry} />}


{/*-------------------------------------------------------------------------------------*/}


        {/* Modeling Category */}
        <div 
        className="mb-4 animate-slide-in-0.6s">
          <button
            onClick={() => toggleCategory('modeling')}
            className="relative w-full px-6 h-60 py-5 text-left transition-colors flex justify-between items-end border-b border-white overflow-hidden"
            style={{
              backgroundImage: 'url(/assets/images/vicar-head.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/40 duration-200 ease-linear"></div>
            
            <h2 className="relative z-10 text-3xl font-semibold text-white">Modeling</h2>
            <span className=" relative z-10 text-2xl text-white">
              {openCategory === 'modeling' ? '−' : '+'}
            </span>
          </button>
          
          {openCategory === 'modeling' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                {catalog && <CmsGrid catalog={catalog} page="portfolio" category="modeling" onOpenModal={openModal} />}
              </div>
            </div>
          )}
        </div>


{/*-------------------------------------------------------------------------------------*/}


        {/* Animation Category */}
        <div className="mb-4 animate-slide-in-0.6s">
        <button
            onClick={() => toggleCategory('animation')}
            className="relative w-full px-6 h-60 py-5 text-left transition-colors flex justify-between items-end border-b border-white overflow-hidden"
            style={{
              backgroundImage: 'url(/assets/images/DMT.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/40 duration-200 ease-linear"></div>
            
            <h2 className="relative z-10 text-3xl font-semibold text-white">Animations</h2>
            <span className=" relative z-10 text-2xl text-white">
              {openCategory === 'animation' ? '−' : '+'}
            </span>
          </button>
          {openCategory === 'animation' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-0">
                {catalog && <CmsGrid catalog={catalog} page="portfolio" category="animation" onOpenModal={openModal} />}
              </div>
            </div>
          )}
        </div>


{/*-------------------------------------------------------------------------------------*/}


        {/* Sketches Category */}
        <div className="mb-4 animate-slide-in-0.6s">
          <button
            onClick={() => toggleCategory('sketches')}
            className="relative w-full px-6 h-60 py-5 text-left transition-colors flex justify-between items-end border-b border-white overflow-hidden"
            style={{
              backgroundImage: 'url(/assets/images/bg-notxt.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/40 duration-200 ease-linear"></div>
            
            <h2 className="relative z-10 text-3xl font-semibold text-white">Sketches</h2>
            <span className="relative z-10 text-2xl text-white">
              {openCategory === 'sketches' ? '−' : '+'}
            </span>
          </button>
          {openCategory === 'sketches' && (
            <div className="p-6">
              <div className="space-y-4">
                <CmsGrid catalog={catalog ?? { articles: [], modals: [] }} page="portfolio" category="sketches" onOpenModal={openModal} />
                <div className="p-4">
                  <h3 className="text-xl mb-2">Sketches</h3>
                  <p className="text-gray-300">Under Construction.</p>
                  <img src="/assets/images/BLENDER.gif" alt="Sketch" className="mt-3 max-w-full h-auto rounded" />
                </div>
                {/* Add more divs as needed */}
              </div>
            </div>
          )}
        </div>

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

