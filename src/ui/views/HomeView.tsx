import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { templateStore } from '../../core/storage/templateStore'
import { createTemplate } from '../../core/template/utils'
import { PRESETS, clonePreset } from '../../core/template/presets'
import { useAppContext } from '../../AppContext'
import type { Template } from '../../core/template/types'

export function HomeView() {
  const { openTab } = useAppContext()
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<Template[]>([])
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [presetsExpanded, setPresetsExpanded] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

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

  const handleDelete = async (id: string) => {
    await templateStore.delete(id)
    setConfirmDeleteId(null)
    refresh()
  }

  const handleDuplicate = async (id: string) => {
    await templateStore.duplicate(id)
    refresh()
  }

  const handleUsePreset = async (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId)
    if (!preset) return
    const t = clonePreset(preset)
    await templateStore.save(t)
    refresh()
    openTab(t.id, t.name)
  }

  const hasTemplates = templates.length > 0

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-100">My Templates</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/gallery')}
            className="px-4 py-2 text-sm rounded border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Community Gallery
          </button>
          <button
            onClick={() => setCreating(true)}
            className={hasTemplates
              ? "px-4 py-2 bg-accent text-gray-900 rounded text-sm font-semibold hover:opacity-90"
              : "px-4 py-2 border border-gray-600 text-gray-300 rounded text-sm hover:bg-gray-700 transition-colors"
            }
          >
            + New Template
          </button>
        </div>
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
          <button onClick={handleCreate} className="px-4 py-2 bg-accent text-gray-900 rounded text-sm font-semibold">
            Create
          </button>
          <button onClick={() => setCreating(false)} className="px-4 py-2 text-gray-400 text-sm">
            Cancel
          </button>
        </div>
      )}

      {/* Presets — full gallery when no user templates, compact collapsible when templates exist */}
      {!hasTemplates && !creating ? (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-gray-200 mb-1">Start from a preset</h2>
          <p className="text-sm text-gray-500 mb-4">Pick a specialty template to get started — you can customize it after.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESETS.map(preset => (
              <div
                key={preset.id}
                className="bg-[rgb(var(--color-surface-raised))] border border-gray-700 rounded-lg p-4 flex flex-col gap-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{preset.icon}</span>
                  <div>
                    <div className="font-medium text-gray-100 text-sm">{preset.name}</div>
                    <div className="text-xs text-gray-500">{preset.specialty}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{preset.description}</p>
                <button
                  onClick={() => handleUsePreset(preset.id)}
                  className="mt-auto px-3 py-1.5 bg-accent text-gray-900 rounded text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Use this template
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : hasTemplates ? (
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setPresetsExpanded(v => !v)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors mb-3"
          >
            <span className="text-xs">{presetsExpanded ? '▾' : '▸'}</span>
            Start from a preset
          </button>
          {presetsExpanded && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {PRESETS.map(preset => (
                <div
                  key={preset.id}
                  className="flex-shrink-0 w-52 bg-[rgb(var(--color-surface-raised))] border border-gray-800 rounded-lg p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{preset.icon}</span>
                    <div className="font-medium text-gray-300 text-xs">{preset.name}</div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{preset.description}</p>
                  <button
                    onClick={() => handleUsePreset(preset.id)}
                    className="mt-auto px-2 py-1 border border-gray-600 text-gray-400 rounded text-xs hover:text-gray-200 hover:border-gray-400 transition-colors"
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

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
              {confirmDeleteId === t.id ? (
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-xs text-gray-500">Delete?</span>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-gray-800"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-800"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(t.id)}
                  className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-gray-800 ml-auto"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
