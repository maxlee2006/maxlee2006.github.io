import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import MediaModal from '../components/MediaModal'

export default function Portfolio() {
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
        

{/*-------------------------------------------------------------------------------------*/}


        <h1 className="text-5xl mb-8 py-10 animate-slide-in-0.5s">ART</h1>


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
            
            <h2 className="relative z-10 text-3xl font-semibold text-white">Projects</h2>
            <span className=" relative z-10 text-2xl text-white">
              {openCategory === 'modeling' ? '−' : '+'}
            </span>
          </button>
          
          {openCategory === 'modeling' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                {/* Easy to edit div objects */}
                <div 
                  className="relative overflow-hidden aspect-square bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => openModal({
                    image: ["/assets/images/gun-model.jpg"],
                    title: "PS-22 Tracer",
                    description: "A small side project that I modeled, baked, and textured over the course of a week.",
                    date: "September 2025 | Blender"
                  })}
                >
                  <img src="/assets/images/gun-model.jpg" alt="Modeling project" className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/10 duration-200 ease-linear"></div>
                </div>

                
                <div 
                  className="relative overflow-hidden aspect-square bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => openModal({
                    image: ["/assets/images/kasu-render.jpg", "/assets/images/kasu-LQ.jpg"],
                    title: "Kasu's Head",
                    description: "A sculpt I made for use in a larger character model I'm working on. Modeled, Baked, Retopologized, and textured over the course of two weeks.",
                    date: "November 2025 | Blender"
                  })}
                >
                  <img src="/assets/images/kasu-render.jpg" alt="Modeling project" className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/10 duration-200 ease-linear"></div>
                </div>


                <div 
                  className="relative overflow-hidden aspect-square bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => openModal({
                    image: ["/assets/images/bg-notxt.png", "/assets/images/vicar-masking.jpg", "/assets/images/vicar-front.jpg", "/assets/images/vicar-back.jpg", "/assets/images/vicar-dark.jpg", "/assets/images/vicar-wip.jpg" ],
                    title: "VICAR Model",
                    description: "A model I created for use in Unreal Engine 5. I worked on this on and off for around 6 months while attending my freshman year of college. Modeled, Baked, Retopologized, Textured, and Rigged in Blender.",
                    date: "December 2024 - June 2025 | Blender"
                  })}
                >
                  <img src="/assets/images/bg-notxt.png" alt="Modeling project" className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/10 duration-200 ease-linear"></div>
                </div>


                <div 
                  className="relative overflow-hidden aspect-square bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => openModal({
                    image: ["/assets/images/rifle-dark.jpg", "/assets/images/rifle-light.jpg",  "/assets/images/rifle-inspect.png"],
                    title: "LR-22 Reacher",
                    description: "A weapon model I created for use in a Parkour Prototype in Unreal Engine 5. Worked on as a high school project. Modeled, Textured, Retopologized, Baked, and Rigged in 2 months during late 2023, and animated in March of 2024.",
                    date: "October 2023 - November 2023, March 2024 | Blender",
                    link: ["https://youtube.com/embed/9wCl1X0lJO8"]
                  })}
                >
                  <img src="/assets/images/rifle-dark.jpg" alt="Modeling project" className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/10 duration-200 ease-linear"></div>
                </div>



                <div 
                  className="relative overflow-hidden aspect-square bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => openModal({
                    image: ["/assets/images/kasu-old-render1.jpg", "/assets/images/kasu-old-render2.jpg", "/assets/images/kasu-old.jpg"],
                    title: "Kasu V1",
                    description: "A model I originally made for an art exhibition, I eventually used in my parkour prototype in Unreal Engine 5. Modeled, Baked, Retopologized, Textured, and Rigged in Blender.",
                    date: "January 2024 - October 2024 | Blender"
                  })}
                >
                  <img src="/assets/images/kasu-old-render1.jpg" alt="Modeling project" className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/10 duration-200 ease-linear"></div>
                </div>

                <div 
                  className="relative overflow-hidden aspect-square bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => openModal({
                    image: ["/assets/images/crappy-old-kasu.jpg", "/assets/images/armguns.jpg"],
                    title: "Old Kasu",
                    description: "An early version of the parkour animation set I ended up using in my Parkour Prototype. Uses an Unfinished humanoid rig, gun rig, and sword model, All created of the course of 2023. Experimented with using Shape Keys and other more advanced rigs to make more complex sections of the humanoid rig.",
                    date: "January 2023 - October 2023 | Blender",
                    link: ["https://youtube.com/embed/uc1CA_6jRBE", "https://youtube.com/embed/60WZZkM7Z2c"]
                  })}
                >
                  <img src="/assets/images/crappy-old-kasu.jpg" alt="Modeling project" className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/10 duration-200 ease-linear"></div>
                </div>


                {/* Add more grid items as needed */}
                

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
                {/* Easy to edit div objects */}


                <div 
                  className="relative overflow-hidden aspect-video bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => openModal({
                    image: ["/assets/images/DMT.png"],
                    title: "Dead Man's Tale (Destiny 2 Fan Animation)",
                    description: "A redo of an animation I created in 2022. Animated over the span of two days. ",
                    date: "May 2025 | Blender",
                    link: ["https://youtube.com/embed/9FSpX1YcTv0"]
                  })}
                >
                  <img src="/assets/images/DMT.png" alt="Modeling project" className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/10 duration-200 ease-linear"></div>
                </div>

               

                {/* Add more grid items as needed */}
                

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
                {/* Easy to edit div objects */}
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

