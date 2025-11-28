import Head from 'next/head'
import Link from 'next/link'

export default function Portfolio() {
  return (
    <>
      <Head>
        <title>Portfolio - Max Lee</title>
        <meta name="description" content="Max Lee's portfolio" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div 
            className="fixed inset-0 z-50 bg-cover bg-center overflow-visible animate-slide-over pointer-events-none"
             style={{
                backgroundImage: 'url(/assets/images/bg.png)',
            }}
            
        />
        <div 
            className="fixed inset-0 w-[2000px] h-[1000px] bg-blue-500 bg-cover bg-center overflow-visible animate-slide-over-slow pointer-events-none"
             style={{

            }}
            
        />
      <main className="max-w-5xl mx-auto px-5">
        {/* Static overlay */}
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
        <nav className="mb-8 pb-4 border-b border-gray-200">
          <Link href="/" className="mr-6 font-medium text-github-blue hover:underline">
            Home
          </Link>
          <Link href="/portfolio" className="mr-6 font-medium text-github-blue hover:underline">
            Portfolio
          </Link>
        </nav>

        <h1 className="text-5xl mb-2">Portfolio</h1>

        <h2 className="text-4xl mt-6 mb-2 pb-1 border-b border-gray-200">Blender</h2>
        <img src="/assets/images/BLENDER.gif" alt="Blender" className="max-w-full h-auto my-4" />
        <p className="mb-2">My Blender Projects</p>
        <a
          href="https://maxlee2006.github.io/portfolio/blender"
          className="btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Projects
        </a>

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

