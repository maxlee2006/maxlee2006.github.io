import { useEffect, useRef, useState } from 'react'
import ContentBody from './ContentBody'
import type { CmsRecord } from '../lib/cms/content'

type MediaModalProps = { item: CmsRecord | null; onClose: () => void }

// Share the content with Admin's inline preview. The real modal still owns its
// overlay, close control, focus trap, and scroll lock; a preview needs none of
// those page-level behaviors while somebody is typing in the document.
export function ModalContent({ item }: { item: CmsRecord }) {
  return <>
    <h3 id="media-modal-title" className="text-2xl font-monoDisplay mb-2 pr-8">{item.title}</h3>
    {item.content.date && <h4 className="text-xl font-funnel mb-2">{item.content.date}</h4>}
    {item.content.method && <h5 className="text-l font-funnel mb-2">{item.content.method}</h5>}
    <ContentBody body={item.content.body} variant="modal" />
  </>
}
// A modal is a dialog over the current page, not a separate article address.
// The page owns the selected row; null means closed. Content is already loaded,
// so opening a card doesn't send another database request.
export default function MediaModal({ item, onClose }: MediaModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const closeButton = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!item) { setIsVisible(false); return }
    setIsVisible(false)
    // Start the fade after the dialog has appeared in the browser's document.
    const timeout = setTimeout(() => setIsVisible(true), 10)
    // Keep keyboard focus in the dialog and freeze background page scrolling.
    // Remember prior values so closing restores the visitor's place.
    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      // Wrap Tab/Shift+Tab between the first and last controls instead of letting
      // keyboard users tab into the page behind the dialog.
      if (event.key === 'Tab') {
        const elements = dialog.current?.querySelectorAll<HTMLElement>('button, a[href], iframe')
        const first = elements?.[0]
        const last = elements?.[elements.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    // React runs cleanup when the dialog closes, changes item, or unmounts.
    // Remove listeners/timers and put focus back on the card that opened it.
    return () => {
      clearTimeout(timeout)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused?.focus()
    }
  }, [item, onClose])
  if (!item) return null
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-opacity duration-300 ease-linear ${isVisible ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="media-modal-title" className="relative max-w-7xl max-h-[90vh] overflow-y-auto bg-black/90 p-6" onClick={event => event.stopPropagation()}>
        <div className="relative max-w-7xl max-h-full">
          <button ref={closeButton} onClick={onClose} className="absolute -top-0 right-0 text-white text-4xl hover:text-gray-300 transition-colors" aria-label="Close">×</button>
          <ModalContent item={item} />
        </div>
      </div>
    </div>
  )
}
