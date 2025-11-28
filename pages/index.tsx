import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <meta name="description" content="Max Lee's personal website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

      </Head>





      <main className="relative flex min-h-screen flex-col items-start justify-start overflow-hidden ">
            <div className="relative z-10 border-y w-full border border-gray-700 bg-white p-4">
                <div
                className="absolute inset-0 -z-10 opacity-40"
                style={{
                    backgroundImage: `
                        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px),
                        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(54, 54, 54, 0.03) 4px)
                    `,
                    backgroundSize: '100% 100%',
                    pointerEvents: 'none',
                }}
                ></div>

                <div className="max-w-5xl space-y-8 text-left">
                <h1 className="text-8xl font-semibold text-black">Max Lee</h1>
                <h1 className="text-5xl font-semibold text-black">//Developer, Artist </h1>
                </div>
            </div>
        

        
            <div className="absolute inset-0 grid grid-cols-1 -z-0 md:grid-cols-4">
                <Link
                href="/professional-projects"
                className="group flex flex-1 flex-col justify-end bg-black/30 px-6 py-10 text-left text-white transition hover:bg-white/10"
                >
                    <p className="text-sm uppercase tracking-wide text-gray-500">Shipped Work</p>
                    <h2 className="text-2xl font-semibold text-white">Professional Projects</h2>
                    <p className="mt-2 text-gray-600">Production experience, shipped titles, and team work.</p>
                </Link>
                
                <Link
                href="/portfolio"
                className="group flex flex-1 flex-col justify-end bg-black/20 px-6 py-10 text-left text-white transition hover:bg-white/10"
                >
                    <p className="text-sm uppercase tracking-wide text-gray-500">Art & Personal Work</p>
                    <h2 className="text-2xl font-semibold text-white">Portfolio</h2>
                    <p className="mt-2 text-gray-600">Blender projects, visual pieces, and personal experiments.</p>
                </Link>
            </div>




      </main>
    </>
  )
}

