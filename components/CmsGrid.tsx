import GridItem from './GridItem'
import type { Catalog, CmsRecord } from '../lib/cms/content'

type Props = { catalog: Catalog; page: CmsRecord['page']; category: string; onOpenModal: (item: CmsRecord) => void }
export default function CmsGrid({ catalog, page, category, onOpenModal }: Props) {
  const items = [
    ...catalog.articles.map(data => ({ data, article: true })),
    ...catalog.modals.map(data => ({ data, article: false })),
  ].filter(({ data }) => data.page === page && data.category === category)
    .sort((a, b) => a.data.sort_order - b.data.sort_order || a.data.slug.localeCompare(b.data.slug))
  return <>{items.map(({ data, article }) => <GridItem key={`${article ? 'article' : 'modal'}-${data.slug}`} data={data} article={article} onOpenModal={onOpenModal} />)}</>
}
