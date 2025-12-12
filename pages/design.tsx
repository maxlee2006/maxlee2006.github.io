import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

export default function Design() {
  const [openCategory, setOpenCategory] = useState<string | null>(null)

  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category)
  }

  return (
    <>
      <Head>
        <title>Portfolio - Max Lee</title>
        <meta name="description" content="Max Lee's portfolio" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-5xl mx-auto px-5">
        
        {/* Static overlay */}

        <Link href="/"
        className="fixed -left-28 top-0 h-full w-30 bg-gray-200 z-50 flex items-center justify-center transition-all hover:bg-white hover:ml-10 hover:w-30 duration-200 ease-linear"
        >
          <div className="-rotate-90 flex  left-[-120px]">
          <h1 className="text-black text-6xl font-funnel">
          ^_BACK_^
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
        


        <h1 className="text-5xl mb-8 animate-slide-in-0.5s">Design Portfolio</h1>

        {/* UE5 Category */}
        <div 
        className="mb-4 animate-slide-in-0.6s">
          
          <button
            onClick={() => toggleCategory('modeling')}
            className="relative w-full px-6 py-6 text-left transition-colors flex justify-between items-center border-b border-white overflow-hidden"
            style={{
              backgroundImage: 'url(/assets/images/ue-still.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/40 duration-200 ease-linear"></div>
            <h2 className="relative z-10 text-3xl font-semibold text-white">Unreal Engine 5</h2>
            <span className="relative z-10 text-2xl text-white">
              {openCategory === 'modeling' ? '−' : '+'}
            </span>
          </button>
          
          {openCategory === 'modeling' && (
            <div className="p-6">
              <div className="space-y-4">
                {/* Easy to edit div objects */}
                <div className="p-4">
                  <h3 className="text-xl mb-2">Parkour Shooter Prototype</h3>
                  <p className="text-gray-500">Summer 2024</p>
                  <iframe
                    width="560"
                    height="315"
                    src="https://www.youtube.com/embed/DQ9c0tJliUY"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
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
      </main>
    </>
  )
}

