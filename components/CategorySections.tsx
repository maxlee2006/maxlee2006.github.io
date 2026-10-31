import { useState } from 'react'
import CmsGrid from './CmsGrid'
import type { Catalog, CmsRecord } from '../lib/cms/content'

export default function CategorySections({ catalog, page, onOpenModal }: { catalog: Catalog; page: CmsRecord['page']; onOpenModal: (item: CmsRecord) => void }) {
  const [open, setOpen] = useState<string | null>(null)
  return <>{catalog.categories.filter(category => category.page === page).map(category => {
    const expanded = open === category.slug
    const empty = ![...catalog.articles, ...catalog.modals].some(record => record.page === page && record.category === category.slug)
    return <section key={category.slug} className="mb-4 animate-slide-in-0.6s">
      <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : category.slug)}
        className="relative w-full px-6 h-60 py-5 text-left flex justify-between items-end border-b border-white overflow-hidden bg-black"
        style={{ backgroundImage: category.image ? `url("${category.image}")` : undefined, backgroundSize: 'cover', backgroundPosition: category.image_position }}>
        <div className="absolute inset-0 bg-black/60 transition-colors hover:bg-black/40 duration-200" />
        <div className="relative z-10 flex items-center gap-3">{category.logo && <img src={category.logo} alt="" className="w-8 h-8" />}<h2 className="text-3xl font-semibold text-white">{category.title}</h2></div>
        <span className="relative z-10 text-2xl" aria-hidden="true">{expanded ? '−' : '+'}</span>
      </button>
      {expanded && <div className="p-6">
        <div className={`grid grid-cols-1 md:grid-cols-2 ${category.columns === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-0`}>
          <CmsGrid catalog={catalog} page={page} category={category.slug} onOpenModal={onOpenModal} />
        </div>
        {empty && (page === 'portfolio' && category.slug === 'sketches'
          ? <div className="p-4"><h3 className="text-xl mb-2">Sketches</h3><p className="text-gray-300">Under Construction.</p><img src="/assets/images/BLENDER.gif" alt="Sketch" className="mt-3 max-w-full h-auto rounded" /></div>
          : <p className="text-gray-400">No projects published in this category yet.</p>)}
      </div>}
    </section>
  })}</>
}
