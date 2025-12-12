import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Portfolio() {
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<{image: string[], title?: string, description?: string, date?: string, link?: string} | null>(null)

  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category)
  }

  const openModal = (item: {image: string[], title?: string, description?: string, date?: string}) => {
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
        


        <h1 className="text-5xl mb-8 animate-slide-in-0.5s">Portfolio</h1>

        {/* Modeling Category */}
        <div 
        className="mb-4 animate-slide-in-0.6s">
          <button
            onClick={() => toggleCategory('modeling')}
            className="relative w-full px-6 h-52 py-5 text-left transition-colors flex justify-between items-end border-b border-white overflow-hidden"
            style={{
              backgroundImage: 'url(/assets/images/bg-notxt.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/40 duration-200 ease-linear"></div>
            
            <h2 className="relative z-10 text-3xl font-semibold text-white">Modeling</h2>
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
                    title: "Gun Model",
                    description: "A small side project that I modeled, baked, and textured over the course of a week.",
                    date: "September 2025 | Blender"
                  })}
                >
                  <img src="/assets/images/gun-model.jpg" alt="Modeling project" className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/40 duration-200 ease-linear"></div>
                </div>

                
                <div 
                  className="relative overflow-hidden aspect-square bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => openModal({
                    image: ["/assets/images/kasu-render.jpg", "/assets/images/kasu-LQ.jpg"],
                    title: "Head Sculpt",
                    description: "A sculpt I made for use in a larger character model I'm working on. Modeled, Baked, Retopologized, and textured over the course of two weeks.",
                    date: "November 2025 | Blender"
                  })}
                >
                  <img src="/assets/images/kasu-render.jpg" alt="Modeling project" className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/40 duration-200 ease-linear"></div>
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
                  <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/40 duration-200 ease-linear"></div>
                </div>


                <div 
                  className="relative overflow-hidden aspect-square bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => openModal({
                    image: ["/assets/images/kasu-old-render1.jpg", "/assets/images/kasu-old-render2.jpg", "/assets/images/kasu-old.jpg"],
                    title: "Parkour Character",
                    description: "A model I originally made for an art exhibition, I eventually used in my parkour prototype in Unreal Engine 5. Modeled, Baked, Retopologized, Textured, and Rigged in Blender.",
                    date: "January 2024 - October 2024 | Blender"
                  })}
                >
                  <img src="/assets/images/kasu-old-render1.jpg" alt="Modeling project" className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/40 duration-200 ease-linear"></div>
                </div>

                {/* Add more grid items as needed */}
                

              </div>
            </div>
          )}
        </div>

        {/* Animation Category */}
        <div className="mb-4 animate-slide-in-0.6s">
          <button
            onClick={() => toggleCategory('animation')}
            className="relative w-full px-6 py-20 text-left transition-colors flex justify-between items-center border-b border-white overflow-hidden"
            style={{
              backgroundImage: 'url(/assets/images/bg-notxt.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/40 duration-200 ease-linear"></div>
            
            <h2 className="relative z-10 text-3xl font-semibold text-white">Animation</h2>
            <span className="relative z-10 text-2xl text-white">
              {openCategory === 'animation' ? '−' : '+'}
            </span>
          </button>
          {openCategory === 'animation' && (
            <div className="p-6">
              <div className="space-y-4">
                {/* Easy to edit div objects */}
                <div className="p-4">
                  <h3 className="text-xl mb-2">Blender Animations</h3>
                  <p className="text-gray-300">Under Construction.</p>
                  <video className="mt-3 max-w-full h-auto rounded" controls>
                    <source src="/path/to/video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>

                {/* Add more divs as needed */}
              </div>
            </div>
          )}
        </div>

        {/* Sketches Category */}
        <div className="mb-4 animate-slide-in-0.6s">
          <button
            onClick={() => toggleCategory('sketches')}
            className="relative w-full px-6 py-20 text-left transition-colors flex justify-between items-center border-b border-white overflow-hidden"
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



        {/* Modal/Popup */}
        {selectedItem && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={closeModal}
          >
            <div className="relative max-w-7xl max-h-[90vh] overflow-y-auto bg-black/90 p-6">
            <div 
              className="relative max-w-7xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute -top-10 right-0 text-white text-4xl hover:text-gray-300 transition-colors"
                aria-label="Close"
              >
                ×
              </button>
              {selectedItem.image.map((imageSrc, index) => (
                <img key={index} src={imageSrc} alt={`${selectedItem.title || 'Image'} ${index + 1}`} className="max-w-full mb-4 last:mb-0" />
              ))}


              {selectedItem.title && <h3 className='text-2xl font-semibold mb-2'>{selectedItem.title}</h3>}
              {selectedItem.description && <h3 className='text-gray-600'>{selectedItem.description}</h3>}
            </div>
            </div>
            
          </div>
        )}
      </main>
    </>
  )
}

