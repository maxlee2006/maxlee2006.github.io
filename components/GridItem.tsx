import Link from 'next/link'
import { articleHref, type CmsRecord } from '../lib/cms/content'

type Props = { data: CmsRecord; onOpenModal?: (item: CmsRecord) => void; article?: boolean }
export default function GridItem({ data, onOpenModal, article = false }: Props) {
  const content = <>
    <img src={data.content.thumbnail} alt={data.title} className="w-full h-full object-cover" />
    <div className="group absolute inset-0 bg-black/10 transition-colors lg:hover:bg-black/60 duration-200 ease-linear">
      <div className="flex items-center flex-col justify-center absolute inset-0 opacity-100 lg:opacity-0 bg-black/60 transition-all duration-300 ease-in-out active:opacity-0 lg:group-hover:opacity-100 lg:hover:bg-black/10">
        <h1 className="text-white text-center text-lg flex items-center justify-center">{data.title}</h1>
        <p className="text-white text-center text-sm">{data.content.card_date ?? data.content.date}</p>
        <p className="text-white text-center text-sm">{data.content.card_method ?? (data.content.method ? `| ${data.content.method} |` : ' ')}</p>
        <p className="text-white text-center text-xs">- view -</p>
      </div>
    </div>
  </>
  const className = 'group relative block w-full text-left overflow-hidden aspect-square bg-white/5 hover:bg-white/10 transition-colors cursor-pointer'
  return article ? <Link href={articleHref(data.slug)} className={className}>{content}</Link>
    : <button type="button" className={className} onClick={() => onOpenModal?.(data)}>{content}</button>
}
