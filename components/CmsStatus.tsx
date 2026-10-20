type Props = { error: string | null; retry: () => void }
// Called while the catalog is absent. Screen-reader roles announce loading or
// failure; retry is supplied by useCatalog and starts a new read, never a write.
export default function CmsStatus({ error, retry }: Props) {
  if (error) return <div role="alert" className="py-4 text-gray-400"><p>{error}</p><button className="btn" onClick={retry}>Try again</button></div>
  return <p role="status" className="py-4 text-gray-400">Loading content…</p>
}
