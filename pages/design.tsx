import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import MediaModal from '../components/MediaModal'
import GridItem from '../components/GridItem'

export default function Design() {
  const [openCategory, setOpenCategory] = useState<string | null>(null)

  const [selectedItem, setSelectedItem] = useState<{image: string[], title?: string, description?: string, date?: string, link?: string[]} | null>(null)

  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category)
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

        <h1 className="text-5xl mb-8 py-10 animate-slide-in-0.5s">Games</h1>

        {/* UE5 Category */}
        <div 
        className="mb-4 animate-slide-in-0.6s">
          
          <button
            onClick={() => toggleCategory('ue')}
            className="relative w-full px-6 h-60 py-5 text-left transition-colors flex justify-between items-end border-b border-white overflow-hidden"
            style={{
              backgroundImage: 'url(/assets/images/ue-still.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/40 duration-200 ease-linear"></div>
            <h2 className="relative z-10 text-3xl font-semibold text-white">Unreal Engine 5</h2>
            <span className="relative z-10 text-2xl text-white">
              {openCategory === 'ue' ? '−' : '+'}
            </span>
          </button>
          
          {openCategory === 'ue' && (
            <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-0">
              {/* Easy to edit div objects */}


              <GridItem 
                onOpenModal={openModal}
                data={{
                  image: "/assets/images/UE5.gif",
                  title: "Parkour FPS Prototype",
                  images: ["/assets/images/UE5.gif"],
                  description: "I spent a summer in 2024 working on a parkour FPS prototype in Unreal Engine 5. I'd previously experimented with FPS projects in the past using UE4, but after a lot more concepting and planning, I decided to try my hand at creating a more polished and playable prototype. I plan to put more work into it in the future, polishing a few animation bugs and adding more features. \n\n The biggest challenge when making this prototype ended up being the small bugs and issues piling up, not the basic mechanics themselves. Setting up animation blueprints, creating dynamic animations for walking and jumping, and various small bugs within each mechanic led to a longer dev time than I expected. \n\n When I come back to this project, I'd like to use all the architectural knowledge I've gained to smooth out the backend blueprints, and add more gameplay prototypes, such as melee weapons. \n\nAttached below is a video that shows the prototype in action, and each of its components I created. All first person models were created in Blender, and can be seen in the art portfolio section.",
                  date: "May 2024 - Present",
                  link: ["https://youtube.com/embed/DQ9c0tJliUY"]
                }}
              />

             

              {/* Add more grid items as needed */}
              

            </div>
          </div>
          )}
        </div>


{/*-------------------------------------------------------------------------------------*/}


        {/* Custom Engine Category */}
        <div 
        className="mb-4 animate-slide-in-0.6s">
          
          <button
            onClick={() => toggleCategory('custom engines')}
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
              {openCategory === 'custom engines' ? '−' : '+'}
            </span>
          </button>
          
          {openCategory === 'custom engines' && (
            <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-0">
              {/* Easy to edit div objects */}
              <GridItem 
                onOpenModal={openModal}
                data={{
                  image: "/assets/images/long-march.png",
                  title: "The Long March Game Project",
                  images: ["/assets/images/long-march-full.png"],
                  description: "I spent a semester working with a team of 5 on a custom C++ engine with OpenGL, meant to be used for a tower defense game. \n\nI had worked on making engines in the past, but not from such a baseic level. I learned a lot about engine flow as well as the more nitty-gritty parts of an engine's framework such as creating an editor and an entity factory system,  which were the two main features I worked on. I acted as the producer of the project as well, directing the team in daily standups and meetings, and making sure we were on track to finish the project. \n\nA big challenge for us initially was optimization, especially when rendering and running collision checks on hundreds of entities per frame. We were able to utilize batch rendering and collision lists to solve the issue, though we are actively working on finding more ways to optimize our engine. \n\nThe Long March is still in development and will be worked on through mid-2026.",
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

