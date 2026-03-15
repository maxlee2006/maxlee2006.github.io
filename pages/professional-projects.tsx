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

{/*-----------------------------------------Custom Engine Category--------------------------------------------*/}


<div 
        className="mb-4 animate-slide-in-0.6s">
          
          <button
            onClick={() => toggleProject('custom engines')}
            className="relative w-full px-6 h-60 py-5 text-left transition-colors flex justify-between items-end border-b border-white overflow-hidden"
            style={{
              backgroundImage: 'url(/assets/images/evergreen.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
          
          <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/40 duration-200 ease-linear"></div>
          <h2 className="relative z-10 text-3xl font-semibold text-white">Custom Engines</h2>
          <span className="relative z-10 text-2xl text-white">
              {openProject === 'custom engines' ? '−' : '+'}
          </span>
          </button>
          
          {openProject === 'custom engines' && (
            <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-0">

              
              {/* Easy to edit div objects */}
              <GridItem 
                onOpenModal={openModal}
                data={{
                  image: "/assets/images/long-march.png",
                  title: "The Long March Game Project",
                  images: ["/assets/images/long-march-full.png"],
                  description: "I spent a semester working with a team of 5 on a custom C++ engine with OpenGL, meant to be used for a tower defense game. \n\nI had worked on making engines in the past, but not from such a basic level. I learned a lot about engine flow as well as the more nitty-gritty parts of an engine's framework such as creating an editor and an entity factory system,  which were the two main features I worked on. I acted as the producer of the project as well, directing the team in daily standups and meetings, and making sure we were on track to finish the project. \n\nA big challenge for us initially was optimization, especially when rendering and running collision checks on hundreds of entities per frame. We were able to utilize batch rendering and collision lists to solve the issue, though we are actively working on finding more ways to optimize our engine. \n\nThe Long March is still in development and will be worked on through mid-2026.",
                  date: "August 2025 - April 2026 | Producer, Programmer",
                  method: "C++, OpenGL",
                  link: ["https://youtube.com/embed/DsthE9H6i4I"]
                }}
              />





              <GridItem 
                onOpenModal={openModal}
                data={{
                  image: "/assets/images/evergreen.png",
                  title: "EVERGREEN",
                  images: ["/assets/images/evergreen-menu.png", "/assets/images/evergreen.png", "/assets/images/evergreen-puzzle.png"],
                  description: "I spent a semester working with a team of 5 on a 2.5D horror game using a custom C engine and an in-house graphics API. I learned the basics of an engine's framework, as well as some common best practices when it comes to handling and renderimg large amounts of entities. Though on a short development cycle, This was a great experience in getting used to team responsibilities and production workflows.",
                  date: "January 2025 - April 2025 | Producer, Programmer",
                  method: "C",
                }}
              />

             

              {/* Add more grid items as needed */}
              

            </div>
          </div>
          )}
        </div>


{/*--------------------------------------Web Development-----------------------------------------------*/}


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
              <h2 className="text-3xl font-semibold text-white">Web Development</h2>
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

