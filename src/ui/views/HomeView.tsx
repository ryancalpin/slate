import { useState, useEffect, useCallback } from 'react'
import { templateStore } from '../../core/storage/templateStore'
import { createTemplate } from '../../core/template/utils'
import { useAppContext } from '../../AppContext'
import type { Template } from '../../core/template/types'

export function HomeView() {
  const { openTab } = useAppContext()
  const [templates, setTemplates] = useState<Template[]>([])
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  // useCallback so refresh is stable and safe in useEffect deps
  const refresh = useCallback(async () => {
    setTemplates(await templateStore.list())
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleCreate = async () => {
    if (!newName.trim()) return
    const t = createTemplate(newName.trim())
    await templateStore.save(t)
    setCreating(false)
    setNewName('')
    openTab(t.id, t.name)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    await templateStore.delete(id)
    refresh()
  }

  const handleDuplicate = async (id: string) => {
    await templateStore.duplicate(id)
    refresh()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-100">My Templates</h1>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 bg-accent-DEFAULT text-gray-900 rounded text-sm font-semibold hover:opacity-90"
        >
          + New Template
        </button>
      </div>

      {creating && (
        <div className="mb-4 flex gap-2">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
            placeholder="Template name…"
            className="flex-1 px-3 py-2 bg-[rgb(var(--color-surface-raised))] border border-gray-700 rounded text-sm text-gray-100 placeholder-gray-500"
          />
          <button onClick={handleCreate} className="px-4 py-2 bg-accent-DEFAULT text-gray-900 rounded text-sm font-semibold">
            Create
          </button>
          <button onClick={() => setCreating(false)} className="px-4 py-2 text-gray-400 text-sm">
            Cancel
          </button>
        </div>
      )}

      {templates.length === 0 && !creating && (
        <p className="text-gray-500 text-sm">No templates yet. Create one to get started.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => (
          <div
            key={t.id}
            className="bg-[rgb(var(--color-surface-raised))] border border-gray-800 rounded-lg p-4 flex flex-col gap-3 cursor-pointer hover:border-gray-600 transition-colors"
            onClick={() => openTab(t.id, t.name)}
          >
            <div className="font-medium text-gray-100 text-sm">{t.name}</div>
            <div className="text-xs text-gray-500">
              {t.pages.length} page{t.pages.length !== 1 ? 's' : ''} ·{' '}
              {t.patientMode === 'roster' ? 'Roster' : 'Single'} ·{' '}
              {t.canvasMode}
            </div>
            <div className="text-xs text-gray-600">
              Updated {new Date(t.updatedAt).toLocaleDateString()}
            </div>
            <div className="flex gap-2 mt-auto" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => handleDuplicate(t.id)}
                className="text-xs text-gray-400 hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-800"
              >
                Duplicate
              </button>
              <button
                onClick={() => handleDelete(t.id, t.name)}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-gray-800 ml-auto"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
