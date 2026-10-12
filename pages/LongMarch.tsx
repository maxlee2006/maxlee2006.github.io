import Head from 'next/head'
import Link from 'next/link'

const gallery = [
  '/assets/images/Screenshot_01.png',
  '/assets/images/Screenshot_03.png',
  '/assets/images/Screenshot_04.png',
]

export default function LongMarch() {
  return (
    <>
      <Head>
        <title>Long March</title>
        <meta name="description" content="The Long March game project by Max Lee" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-5xl mx-auto px-5 pt-20 md:pt-5 pb-16">
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

        <div
          className="relative w-full h-60 md:h-80 mb-8 overflow-hidden border-b border-white animate-slide-in-0.6s"
          style={{
            backgroundImage: 'url(/assets/images/Library_Hero_3840_1240.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <img
            src="/assets/images/Library_Logo_1280_720.png"
            alt=""
            className="absolute inset-y-0 left-0 bottom-8 py-3 z-10 h-60 w-auto object-contain pointer-events-none"
          />

          
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="relative z-10 h-full flex flex-col justify-end alignment-right px-6 py-5">
            <p className="text-2xl uppercase tracking-wide text-gray-100">Custom Engine | C++, OpenGL</p>
            <p className="mt-1 text-xl text-gray-300">August 2025 – September 2026 | Producer, Programmer</p>
          </div>


        </div>

        <div className="space-y-4 animate-slide-in-0.7s">
          <p className="text-gray-300">
            I spent two semesters working with a team of 5 on a tower defense game created using a custom C++ engine with OpenGL.
          </p>
          <p className="text-gray-300">
            I had worked on making engines in the past, but not from such a basic level. I learned a lot about engine flow as well as the more nitty-gritty parts of an engine&apos;s framework such as creating an editor and an entity factory system, which were the two main features I worked on. I acted as the producer of the project as well, directing the team in daily standups and meetings, and making sure we were on track to finish the project.
          </p>
          <p className="text-gray-300">
            A big challenge for us initially was optimization, especially when rendering and running collision checks on hundreds of entities per frame. We were able to utilize batch rendering and collision lists to solve the issue, though we are actively working on finding more ways to optimize our engine.
          </p>
          <p className="text-gray-300">
            The Long March has been released and is available to play!
          </p>
          <p className="text-gray-400">C++, OpenGL</p>
        </div>

        <div className="mt-10 animate-slide-in-0.7s">
        <iframe width="646" height="190"
            className="w-full"
            src="https://store.steampowered.com/widget/5206450/"
            title="The Long March gameplay"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          <iframe
            className="w-full"
            style={{ aspectRatio: '16/9' }}
            src="https://youtube.com/embed/exs0QeAbhKg"
            title="The Long March gameplay"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div className="grid grid-cols-1  gap-4 mt-10 animate-slide-in-1s">
          {gallery.map((image) => (
            <div key={image} className="relative overflow-hidden  bg-white/5">
              <img src={image} alt="The Long March" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
