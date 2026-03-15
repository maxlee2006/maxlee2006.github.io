import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import MediaModal from '../components/MediaModal'
import GridItem from '../components/GridItem'
import type { URL_link } from '../components/MediaModal'
import { link } from 'fs'

export default function Professional() {
  const [openProject, setOpenProject] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<{image: string[], title?: string, description?: string, date?: string, link?: string[]} | null>(null)

  const toggleProject = (project: string) => {
    setOpenProject(openProject === project ? null : project)
  }

  const openModal = (item: {image: string[], title?: string, description?: string, date?: string, link?: string[]}) => {
    setSelectedItem(item)
  }

  const closeModal = () => {
    setSelectedItem(null)
  }

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

        <div className="mb-4 animate-slide-in-0.6s">
          <button
            onClick={() => toggleProject('music-nerd')}
            className="relative w-full px-6 h-60 py-5 text-left transition-colors flex justify-between items-end border-b border-white overflow-hidden"
            style={{
              backgroundImage: 'url(/assets/images/mn-web.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'top',
            }}
          >
            <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/40 duration-200 ease-linear"></div>
            
            <div className="relative z-10 flex items-center gap-3">
              <img src="/assets/images/mn-logo-128.png" alt="" className="w-8 h-8" />
              <h2 className="text-2xl font-semibold text-white">Music Nerd</h2>
            </div>
            <span className="relative z-10 text-2xl text-white">
              {openProject === 'music-nerd' ? '−' : '+'}
            </span>
          </button>
          
          {openProject === 'music-nerd' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-0">
                <GridItem 
                  onOpenModal={openModal}
                  data={{
                    image: "/assets/images/mn-web-2.png",
                    title: "Music Nerd Website",
                    images: ["/assets/images/mn-web-2.png"],
                    description: "Refactored and enhanced search feature and artist pages.\n\nContributions:\n- 50% faster artist search endpoint using indexing and trigram search\n- Generated artist bios using OpenAI API\n- Wrote tests using Jest",
                    date: "May 2025 - July 2025 | Programmer",
                    method: "TypeScript, HTML, CSS",
                    link: ["https://www.musicnerd.xyz/"]
                  }}
                />

                <GridItem 
                  onOpenModal={openModal}
                  data={{
                    image: "/assets/images/mn-ext.png",
                    title: "MN Chrome Extension",
                    images: ["/assets/images/mn-ext.png"],
                    description: "Created, programmed, designed, and released a Chrome extension.\n\nContributions:\n- Designed UI\n- Pulled Music Nerd data from backend database \n\nDownload here: \n",
                    date: "July 2025 - August 2025 | Programmer",
                    method: "TypeScript, HTML, CSS",
                    URLs: [{link: "https://chromewebstore.google.com/detail/music-nerd-chrome-extensi/hoafengifajodeelbinmgbehghofjnmd", title:"Music Nerd Chrome Extension"}]
                  }}
                />
              </div>
            </div>
          )}
        </div>

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

