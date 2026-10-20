import type { ContentBlock } from '../lib/cms/content'

type Props = { body: ContentBlock[]; variant: 'article' | 'modal'; layout?: 'text' | 'embeds' | 'gallery' }
/** Display already-validated blocks in their saved array order.
 * This component does no fetching. React treats text as text (escaping HTML),
 * so an author cannot inject executable markup through a paragraph.
 * variant changes presentation; it doesn't change the saved content format.
 */
export default function ContentBody({ body, variant, layout }: Props) {
  return <>{body.map((block, index) => {
    switch (block.type) {
      case 'paragraph':
        return <p key={index} className={variant === 'modal' ? 'text-gray-400 font-funnel whitespace-pre-line' : `${block.muted ? 'text-gray-400' : 'text-gray-300'} whitespace-pre-line`}>{block.text}</p>
      case 'heading':
        return <h2 key={index} className="text-2xl mt-6 mb-2">{block.text}</h2>
      case 'image': {
        const image = <img src={block.src} alt={block.alt} className={variant === 'modal' ? 'max-w-full py-4' : 'w-full h-full object-cover'} />
        return <figure key={index} className={variant === 'modal' ? `flex flex-col items-center justify-center ${body[index + 1]?.type === 'image' ? 'mb-4' : ''}` : layout === 'gallery' ? 'relative overflow-hidden bg-white/5' : 'my-4'}>
          {image}{block.caption && <figcaption className="text-gray-400 text-sm text-center">{block.caption}</figcaption>}
        </figure>
      }
      case 'link':
        return <div key={index} className="text-blue-500 font-funnel whitespace-pre-line transition-all hover:text-blue-100"><a href={block.href} target="_blank" rel="noopener noreferrer">{block.text}</a></div>
      // The validator restricts providers; sandbox further limits what an embedded
      // page can do. These permissions allow supported players to work; they do
      // not grant access to our database or make arbitrary embed hosts acceptable.
      case 'embed':
        return <iframe key={index} className="w-full" style={block.height ? { height: block.height } : { aspectRatio: '16/9' }}
          src={block.src} title={block.title} sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      // Recursion renders a group's own ordered body using the same rules.
      // The validator limits depth before any block arrives here.
      case 'group':
        return <div key={index} className={block.layout === 'text' ? 'space-y-4 animate-slide-in-0.7s' : block.layout === 'embeds' ? 'mt-10 animate-slide-in-0.7s' : 'grid grid-cols-1 gap-4 mt-10 animate-slide-in-1s'}>
          <ContentBody body={block.body} variant={variant} layout={block.layout} />
        </div>
    }
  })}</>
}
