import { useEffect, useState } from 'react'

export type URL_link = {
  link: string
  title: string
}

type MediaItem = {
  image: string[]
  title?: string
  description?: string
  date?: string
  method?: string
  link?: string[]
  URLS?: URL_link[]
}

type MediaModalProps = {
  item: MediaItem | null
  onClose: () => void
}

export default function MediaModal({ item, onClose }: MediaModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Trigger fade-in after mount
  useEffect(() => {
    if (item) {
      // Reset visibility when item changes
      setIsVisible(false)
      // Trigger fade-in after a brief delay
      const timeout = setTimeout(() => setIsVisible(true), 10)
      return () => clearTimeout(timeout)
    } else {
      setIsVisible(false)
    }
  }, [item])

  if (!item) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4
        transition-opacity duration-300 ease-linear
        ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div className="relative max-w-7xl max-h-[90vh] overflow-y-auto bg-black/90 p-6">
        <div
          className="relative max-w-7xl max-h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute -top-0 right-0 text-white text-4xl hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            ×
          </button>

          {item.title && <h3 className="text-2xl font-monoDisplay mb-2">{item.title}</h3>}
          {item.date && <h4 className="text-xl font-funnel mb-2">{item.date}</h4>}
          {item.method && <h5 className="text-l font-funnel mb-2">{item.method}</h5>}
          {item.description && (
            <h3 className="text-gray-400 font-funnel whitespace-pre-line">{item.description}</h3>
          )}
          {item.URLS && <div className="text-blue-500 font-funnel whitespace-pre-line transition-all hover:text-blue-100">
              {item.URLS.map((url, index) => (
                <a href={url.link} target="_blank" rel="noopener noreferrer">
                  {url.title}
              </a>
              ))}
            </div>}
          <div className="flex flex-col items-center justify-center">
            {item.image.map((imageSrc, index) => (
              <img
                key={index}
                src={imageSrc}
                alt={`${item.title || 'Image'} ${index + 1}`}
                className="max-w-full mb-4 py-4 last:mb-0"
              />
            ))}
          </div>
          
          {item.link && (
            <div className="flex flex-col items-center justify-center">
              {item.link.map((linksrc, index) => (
                <iframe
                  key={index}
                  className="inset-0 w-full h-full"
                  style={{ aspectRatio: '16/9' }}
                  src={`${linksrc}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

