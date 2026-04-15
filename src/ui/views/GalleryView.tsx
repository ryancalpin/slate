import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import {
  fetchGalleryIndex,
  importGalleryTemplate,
  type GalleryTemplateEntry,
} from '../../core/gallery/galleryClient'
import { templateStore } from '../../core/storage/templateStore'

function TagChip({ tag }: { tag: string }) {
  return (
    <span className="inline-block text-xs bg-gray-700 text-gray-300 rounded px-1.5 py-0.5">
      {tag}
    </span>
  )
}

function GalleryCard({
  entry,
  onImport,
  importing,
}: {
  entry: GalleryTemplateEntry
  onImport: (entry: GalleryTemplateEntry) => void
  importing: boolean
}) {
  return (
    <div className="p-4 rounded-lg bg-[rgb(var(--color-surface-raised))] border border-gray-700 space-y-3 flex flex-col">
      <div>
        <div className="font-semibold text-white">{entry.name}</div>
        <div className="text-xs text-gray-400 mt-0.5">by {entry.author} · v{entry.version}</div>
      </div>

      <p className="text-sm text-gray-300 leading-snug flex-1">{entry.description}</p>

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => onImport(entry)}
        disabled={importing}
        className={clsx(
          'w-full py-2 text-sm rounded font-medium transition-colors',
          importing
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-accent text-white hover:opacity-90',
        )}
      >
        {importing ? 'Importing…' : 'Import'}
      </button>
    </div>
  )
}

export function GalleryView() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<GalleryTemplateEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [importingId, setImportingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const result = await fetchGalleryIndex()
      setEntries(result.templates)
      if (result.error) setError(result.error)
      setLoading(false)
    }
    void load()
  }, [])

  const handleImport = useCallback(async (entry: GalleryTemplateEntry) => {
    setImportingId(entry.id)
    try {
      const template = await importGalleryTemplate(entry.ptjsonUrl)
      await templateStore.save(template)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import template')
    } finally {
      setImportingId(null)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[rgb(var(--color-surface))] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Community Gallery</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Browse and import community-contributed templates
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-amber-900/30 border border-amber-700 text-amber-300 text-sm">
            {error}
          </div>
        )}

        {loading && <p className="text-gray-400 text-sm">Loading community templates…</p>}

        {!loading && entries.length === 0 && !error && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No templates available</p>
            <p className="text-sm mt-1">The community gallery is empty or unavailable.</p>
          </div>
        )}

        {entries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <GalleryCard
                key={entry.id}
                entry={entry}
                onImport={handleImport}
                importing={importingId === entry.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
