import Link from 'next/link'
import { articleHref, type ContentButton } from '../lib/cms/content'

export default function ContentButtons({ buttons }: { buttons: ContentButton[] }) {
  return <div className="content-buttons my-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {buttons.map((button, index) => {
      const href = button.article ? articleHref(button.article) : button.href!
      const external = href.startsWith('https:')
      return <Link key={index} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
        className="content-button group relative isolate flex min-h-[8rem] min-w-0 items-center justify-center overflow-hidden border border-white/30 bg-black p-6 text-center text-white transition-colors hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
        {button.image && <>
          <img src={button.image} alt="" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <span aria-hidden="true" className="absolute inset-0 -z-10 bg-black/60" />
        </>}
        <span className="break-words font-monoDisplay text-xl">{button.text}</span>
      </Link>
    })}
  </div>
}
