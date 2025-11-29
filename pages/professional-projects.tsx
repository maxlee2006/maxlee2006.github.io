import Head from 'next/head'
import Link from 'next/link'

export default function Professional() {
  return (
    <>
      <Head>

      

        <meta name="description" content="Max Lee's professional projects" />
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


        


            


        <h2 className="text-4xl mt-6 mb-2 pb-1 border-b border-gray-200 animate-slide-in-0.5s">Projects</h2>

        <div className="mb-8 pb-6 border-b border-gray-200 last:border-b-0 animate-slide-in-0.6s">
            
          <h3 className="text-2xl mt-4 mb-2 flex items-center gap-3">
            <img src="/assets/images/mn-logo-128.png" alt="" className="w-6 h-6" />
            Music Nerd Website {' '}
            <a href="https://musicnerd.xyz" className="btn" target="_blank" rel="noopener noreferrer">
            Website
            </a>
          </h3>
          <h4 className="text-xl mt-3 mb-1 text-gray-600">May 2025 - July 2025</h4>
          <h4 className="text-xl mt-3 mb-1 text-gray-600">Programmer</h4>
          <p className="mb-2">Refactored and enhanced search feature and artist pages.</p>
          <h4 className="text-xl mt-3 mb-1 text-gray-600">Contributions:</h4>
          <ul className="ml-6 mb-4">
            <li className="mb-1">50% faster artist search endpoint using indexing and trigram search</li>
            <li className="mb-1">Generated artist bios using OpenAI API</li>
            <li className="mb-1">Wrote tests using Jest</li>
          </ul>
        </div>

        <div className="mb-8 pb-6 border-b border-gray-200 last:border-b-0 animate-slide-in-0.6s">
          <h3 className="text-2xl mt-4 mb-2 flex items-center gap-3">
          <img src="/assets/images/mn-logo-128.png" alt="" className="w-6 h-6" />
            Music Nerd Chrome Extension |{' '}
            <a
              href="https://chromewebstore.google.com/detail/music-nerd-chrome-extensi/hoafengifajodeelbinmgbehghofjnmd?utm_source=item-share-cb"
              className="btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download the extension
            </a>
          </h3>
          <h4 className="text-xl mt-3 mb-1 text-gray-600">July 2025 - August 2025</h4>
          <h4 className="text-xl mt-3 mb-1 text-gray-600">Programmer</h4>
          <p className="mb-2">Created, programmed, designed, and released a chrome extension</p>
          <h4 className="text-xl mt-3 mb-1 text-gray-600">Contributions:</h4>
          <ul className="ml-6 mb-4">
            <li className="mb-1">Designed UI</li>
            <li className="mb-1">Pulled Music Nerd data from backend database</li>
          </ul>
        </div>

        <div className="mb-8 pb-6 border-b border-gray-200 last:border-b-0 animate-slide-in-0.6s">
          <h3 className="text-2xl mt-4 mb-2">Long March Game Project</h3>
          <h4 className="text-xl mt-3 mb-1 text-gray-600">September 2025 - April 2026</h4>
          <h4 className="text-xl mt-3 mb-1 text-gray-600">Producer/Programmer</h4>
          <p className="mb-2">Custom C++ engine with OpenGL.</p>
          <h4 className="text-xl mt-3 mb-1 text-gray-600">Contributions:</h4>
          <ul className="ml-6 mb-4">
            <li className="mb-1">Tilemap rendering</li>
            <li className="mb-1">Object factory system</li>
            <li className="mb-1">Deserialization using JSON</li>
          </ul>
        </div>

        <div className="mb-8 pb-6 border-b border-gray-200 last:border-b-0 animate-slide-in-0.6s">
          <h3 className="text-2xl mt-4 mb-2">EVERGREEN</h3>
          <h4 className="text-xl mt-3 mb-1 text-gray-600">January 2025 - April 2025</h4>
          <h4 className="text-xl mt-3 mb-1 text-gray-600">Producer/Programmer</h4>
          <p className="mb-2">Custom C engine using in house graphics API.</p>
          <h4 className="text-xl mt-3 mb-1 text-gray-600">Contributions:</h4>
          <ul className="ml-6 mb-4">
            <li className="mb-1">Initial engine architecture</li>
            <li className="mb-1">Deserialization with text files</li>
            <li className="mb-1">Entity lists and scene organization</li>
          </ul>
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
      </main>
    </>
  )
}

