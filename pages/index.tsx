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

                <div className="max-w-5xl space-y-4 text-left">
                <h1 className="text-7xl p-0 font-funnel animate-slide-in-0.5s font-semibold  text-black">Max Lee</h1>
                <h1 className="text-2xl animate-slide-in-0.7s font-semibold text-black">Developer, Artist </h1>
                </div>
            </div>
        

        
            <div className="absolute inset-0 grid grid-cols-1 -z-0 md:grid-cols-4">
                <Link
                style={{
                  backgroundImage: 'url(/assets/images/website.png)',
                  backgroundSize: 'cover',      // make it cover the whole area
                  backgroundPosition: 'center',  // center it
                }}
                href="/professional-projects"
                className="group relative flex flex-1 flex-col justify-end bg-black/20 px-6 py-10 text-left text-white transition hover:bg-white/10"
                >
                    <div className=" absolute inset-0 bg-black/80 transition-colors group-hover:bg-black/50 duration-200 ease-linear"></div>

                    <div className='relative z-10'>
                        <p className="text-sm uppercase tracking-wide text-gray-300">Shipped Work</p>
                        <h2 className="text-3xl font-semibold text-white">Code</h2>
                        <p className="mt-2 text-gray-400">Production experience, shipped projects, and team work</p>
                    </div>
                    
                </Link>
                

                <Link
                style={{
                    backgroundImage: 'url(/assets/images/bg-notxt.png)',
                    backgroundSize: 'cover',      // make it cover the whole area
                    backgroundPosition: 'center',  // center it
                  }}
                href="/portfolio"
                className="group relative flex flex-1 flex-col justify-end bg-black/20 px-6 py-10 text-left text-white transition hover:bg-white/10"
                >                    
                
                <div className=" absolute inset-0 bg-black/80 transition-colors group-hover:bg-black/50 duration-200 ease-linear"></div>

                    <div className='relative z-10'>
                        <p className="text-sm uppercase tracking-wide text-gray-300">Art Projects</p>
                        <h2 className="text-3xl font-semibold text-white">Art</h2>
                        <p className="mt-2 text-gray-400">Blender projects, animations, and sketches</p>   
                    </div>
                </Link>


                <Link
                style={{
                    backgroundImage: 'url(/assets/images/ue-still.png)',
                    backgroundSize: 'cover',      // make it cover the whole area
                    backgroundPosition: 'top',  // center it
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundImage = "url('/assets/images/UE5.gif')"}
                  onMouseLeave={e => e.currentTarget.style.backgroundImage = "url('/assets/images/ue-still.png')" }
                href="/design"
                className="group relative flex flex-1 flex-col justify-end bg-black/20 px-6 py-10 text-left text-white transition hover:bg-white/10"
                >                    
                
                <div className=" absolute inset-0 bg-black/80 transition-colors group-hover:bg-black/50 duration-200 ease-linear"></div>

                    <div className='relative z-10'>
                        <p className="text-sm uppercase tracking-wide text-gray-300">Engine building and In-Engine work</p>
                        <h2 className="text-3xl font-semibold text-white">Games</h2>
                        <p className="mt-2 text-gray-400">Unreal Engine and custom engines</p>   
                    </div>
                </Link>


            </div>




      </main>
    </>
  )
}

