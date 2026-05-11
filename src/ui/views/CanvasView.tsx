import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useTemplate } from '../../hooks/useTemplate'
import { createModuleInstance, createPage } from '../../core/template/utils'
import { templateStore } from '../../core/storage/templateStore'
import { GridCanvas } from '../../canvas/GridCanvas'
import { FreeformCanvas } from '../../canvas/FreeformCanvas'
import { SectionsCanvas, type CanvasSection } from '../../canvas/SectionsCanvas'
import { ModulePalette } from '../shell/ModulePalette'
import { PageTabs } from '../components/PageTabs'
import { SnapshotTimeline } from '../components/SnapshotTimeline'
import { PatientSelector } from '../components/PatientSelector'
import { CommandPalette } from '../components/CommandPalette'
import { applySnapshotToTemplate } from '../../core/snapshot/snapshotEngine'
import { usePatientSlot } from '../../hooks/usePatientSlot'
import type { AppMode, TemplatePage, Template, ModuleInstance } from '../../core/template/types'

interface Props { mode: AppMode }

export function CanvasView({ mode }: Props) {
  const { id } = useParams<{ id: string }>()
  const { template, loading, saveTemplate } = useTemplate(id ?? null)

  // Multi-page state
  const [activePageId, setActivePageId] = useState<string>('')

  // Snapshot state
  const [activeSnapshotDate, setActiveSnapshotDate] = useState<string | null>(null)

  // Feature 1: Undo/Redo history
  const [layoutHistory, setLayoutHistory] = useState<ModuleInstance[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Feature 2: Inline template rename
  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState('')

  // Feature 3: Debounced save ref + saved indicator
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)
  const savedFlashRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Command palette (Cmd+K / Ctrl+K)
  const [showCommandPalette, setShowCommandPalette] = useState(false)

  // Seed undo history baseline when the active page changes
  const historyPageRef = useRef<string>('')
  useEffect(() => {
    if (!template || !activePageId) return
    if (historyPageRef.current === activePageId) return
    const page = template.pages.find((p) => p.id === activePageId)
    if (!page) return
    historyPageRef.current = activePageId
    setLayoutHistory([page.layout])
    setHistoryIndex(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePageId, template?.id])

  // Sync activePageId when template loads or changes
  useEffect(() => {
    if (!template?.pages?.length) return
    if (!template.pages.find((p) => p.id === activePageId)) {
      setActivePageId(template.pages[0].id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.id])

  // Roster patient slot hook
  const handleTemplateUpdate = useCallback((updated: Template) => {
    void saveTemplate(updated)
  }, [saveTemplate])

  const {
    activeSlotId,
    setActiveSlotId,
    getData,
    setData: setSlotData,
    addSlot,
  } = usePatientSlot(template, handleTemplateUpdate)

  const showSavedFlash = useCallback(() => {
    setSavedFlash(true)
    if (savedFlashRef.current) clearTimeout(savedFlashRef.current)
    savedFlashRef.current = setTimeout(() => setSavedFlash(false), 1500)
  }, [])

  // Feature 3: Debounced save for single-patient data changes
  const debouncedSave = useCallback((updated: Template) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      void saveTemplate(updated)
      showSavedFlash()
    }, 500)
  }, [saveTemplate, showSavedFlash])

  if (loading) return (
    <div className="flex h-full overflow-hidden flex-col animate-pulse">
      <div className="h-8 bg-gray-800 border-b border-gray-700" />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-4 flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="h-32 rounded bg-gray-800 flex-1" />
            <div className="h-32 rounded bg-gray-800 flex-1" />
            <div className="h-32 rounded bg-gray-800 flex-1" />
          </div>
          <div className="flex gap-4">
            <div className="h-48 rounded bg-gray-800 w-2/3" />
            <div className="h-48 rounded bg-gray-800 flex-1" />
          </div>
        </div>
        <div className="w-56 border-l border-gray-800 bg-gray-900" />
      </div>
    </div>
  )
  if (!template) return <div className="p-8 text-gray-500 text-sm">Template not found.</div>

  // Derive displayed template (snapshot overlay or live)
  const displayedTemplate = activeSnapshotDate
    ? applySnapshotToTemplate(template, activeSnapshotDate)
    : template

  const isBuildMode = mode === 'build'
  const activePage = displayedTemplate.pages.find((p) => p.id === activePageId) ?? displayedTemplate.pages[0]

  const handlePageChange = async (updated: TemplatePage) => {
    const updatedTemplate = {
      ...template,
      pages: template.pages.map((p) => (p.id === updated.id ? updated : p)),
    }
    await saveTemplate(updatedTemplate)
  }

  // Feature 3: Debounced data change handler
  const handleDataChange = async (instanceId: string, fieldData: Record<string, unknown>) => {
    if (template.patientMode === 'roster') {
      await setSlotData(instanceId, fieldData)
    } else {
      const updatedData = { ...template.singleData, [instanceId]: fieldData }
      debouncedSave({ ...template, singleData: updatedData })
    }
  }

  // Feature 1: Push layout snapshot to history
  const pushHistory = (layout: ModuleInstance[]) => {
    setLayoutHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1)
      const next = [...trimmed, layout].slice(-30)
      setHistoryIndex(next.length - 1)
      return next
    })
  }

  const handleAddModule = async (moduleId: string, version: string, defaultConfig: Record<string, unknown>) => {
    if (!activePage) return
    const offset = activePage.layout.length
    const instance = createModuleInstance(moduleId, version, {
      x: (offset * 2) % 10,
      y: Math.floor(offset / 5) * 4,
      w: 4,
      h: 3,
    }, defaultConfig)
    const newLayout = [...activePage.layout, instance]
    await handlePageChange({ ...activePage, layout: newLayout })
    pushHistory(newLayout)
  }

  const handleLayoutChange = async (updated: ModuleInstance[]) => {
    if (!activePage) return
    await handlePageChange({ ...activePage, layout: updated })
    pushHistory(updated)
  }

  // Feature 1: Named undo/redo functions (used by both keyboard and buttons)
  const handleUndo = () => {
    if (historyIndex > 0 && activePage) {
      const prev = layoutHistory[historyIndex - 1]
      setHistoryIndex(i => i - 1)
      void handlePageChange({ ...activePage, layout: prev })
    }
  }

  const handleRedo = () => {
    if (historyIndex < layoutHistory.length - 1 && activePage) {
      const next = layoutHistory[historyIndex + 1]
      setHistoryIndex(i => i + 1)
      void handlePageChange({ ...activePage, layout: next })
    }
  }

  const handleAddPage = async () => {
    const newPage = createPage(`Page ${template.pages.length + 1}`)
    const updated: Template = {
      ...template,
      pages: [...template.pages, newPage],
      updatedAt: new Date().toISOString(),
    }
    await templateStore.save(updated)
    void saveTemplate(updated)
    setActivePageId(newPage.id)
  }

  const handleDeletePage = async (pageId: string) => {
    if (template.pages.length <= 1) return
    const pages = template.pages.filter((p) => p.id !== pageId)
    const updated: Template = { ...template, pages, updatedAt: new Date().toISOString() }
    await templateStore.save(updated)
    void saveTemplate(updated)
    if (activePageId === pageId) {
      setActivePageId(pages[0].id)
    }
  }

  const handleSectionsChange = async (sections: CanvasSection[]) => {
    if (!activePage) return
    const updatedPages = template.pages.map((p) =>
      p.id === activePage.id ? { ...p, sections } : p,
    )
    const updated: Template = { ...template, pages: updatedPages, updatedAt: new Date().toISOString() }
    await templateStore.save(updated)
    void saveTemplate(updated)
  }

  // Get data for active slot
  const getInstanceData = (instanceId: string) =>
    template.patientMode === 'roster'
      ? getData(instanceId)
      : (template.singleData?.[instanceId] ?? {})

  const canvasMode = activePage?.canvasMode ?? template.canvasMode

  return (
    <UndoRedoKeyHandler
      historyIndex={historyIndex}
      layoutHistory={layoutHistory}
      activePage={activePage}
      onUndo={handleUndo}
      onRedo={handleRedo}
      mode={mode}
      onShowCommandPalette={setShowCommandPalette}
    >
      {showCommandPalette && (
        <CommandPalette
          onAddModule={async (moduleId, version, defaultConfig) => {
            await handleAddModule(moduleId, version, defaultConfig)
            setShowCommandPalette(false)
          }}
          onClose={() => setShowCommandPalette(false)}
        />
      )}
      <div className="flex h-full overflow-hidden flex-col">
        {/* Page tabs */}
        <PageTabs
          pages={displayedTemplate.pages}
          activePageId={activePage?.id ?? ''}
          onSelect={setActivePageId}
          onAdd={handleAddPage}
          onDelete={handleDeletePage}
          canEdit={isBuildMode && !activeSnapshotDate}
        />

        {/* Roster patient selector */}
        {template.patientMode === 'roster' && !isBuildMode && (
          <div className="px-4 py-2 border-b border-gray-800 flex items-center">
            <PatientSelector
              slots={template.patientSlots ?? []}
              activeSlotId={activeSlotId}
              onSelect={setActiveSlotId}
              onAddSlot={(label, room) => addSlot({ label, room })}
            />
          </div>
        )}

        {/* Canvas mode switcher + patient mode toggle + rename + undo/redo — build mode only */}
        {isBuildMode && !activeSnapshotDate && activePage && (
          <div className="flex items-center gap-1 px-4 py-1 border-b border-gray-800 bg-gray-900">
            {/* Feature 2: Inline template rename */}
            {editingName ? (
              <input
                autoFocus
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                onBlur={async () => {
                  if (draftName.trim() && draftName !== template.name) {
                    await saveTemplate({ ...template, name: draftName.trim(), updatedAt: new Date().toISOString() })
                  }
                  setEditingName(false)
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') e.currentTarget.blur()
                  if (e.key === 'Escape') { setEditingName(false) }
                }}
                className="text-xs bg-gray-900 border border-gray-600 rounded px-2 py-0.5 text-gray-100 w-40 mr-3"
              />
            ) : (
              <button
                onClick={() => { setDraftName(template.name); setEditingName(true) }}
                title="Click to rename template"
                className="text-xs text-gray-400 hover:text-gray-200 mr-3 truncate max-w-[150px]"
              >
                ✏️ {template.name}
              </button>
            )}

            <span className="text-xs text-gray-500 mr-2">Canvas:</span>
            {(['grid', 'freeform', 'sections'] as const).map(m => (
              <button
                key={m}
                onClick={() => handlePageChange({ ...activePage, canvasMode: m })}
                className={`px-2 py-0.5 text-xs rounded capitalize transition-colors ${
                  canvasMode === m
                    ? 'bg-accent text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                {m}
              </button>
            ))}

            {/* Patient mode toggle */}
            <div className="flex items-center gap-1 ml-4">
              <span className="text-xs text-gray-500 mr-1">Mode:</span>
              {(['single', 'roster'] as const).map(m => (
                <button
                  key={m}
                  onClick={async () => {
                    const updated = { ...template, patientMode: m as 'single' | 'roster', updatedAt: new Date().toISOString() }
                    await saveTemplate(updated)
                  }}
                  className={`px-2 py-0.5 text-xs rounded capitalize transition-colors ${
                    template.patientMode === m
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  {m === 'single' ? 'Single Patient' : 'Roster'}
                </button>
              ))}
            </div>

            {/* Feature 4: Default mode toggle */}
            <div className="flex items-center gap-1 ml-2 border-l border-gray-700 pl-3">
              <span className="text-xs text-gray-500 mr-1">Opens in:</span>
              {(['build', 'live'] as const).map(m => (
                <button
                  key={m}
                  onClick={async () => {
                    await saveTemplate({ ...template, defaultMode: m, updatedAt: new Date().toISOString() })
                  }}
                  className={`px-2 py-0.5 text-xs rounded capitalize transition-colors ${
                    (template.defaultMode ?? 'build') === m
                      ? 'bg-purple-700 text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  {m === 'build' ? 'Build' : 'Live'}
                </button>
              ))}
            </div>

            {/* Feature 1: Undo/Redo buttons + save indicator */}
            <div className="flex items-center gap-1 ml-auto">
              {savedFlash && (
                <span className="text-xs text-green-400 opacity-80 mr-1 transition-opacity">Saved</span>
              )}
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                title="Undo (Ctrl+Z)"
                className="px-2 py-0.5 text-xs text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >↩ Undo</button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= layoutHistory.length - 1}
                title="Redo (Ctrl+Y)"
                className="px-2 py-0.5 text-xs text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >↪ Redo</button>
            </div>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          <div id="canvas-root" className="flex-1 overflow-auto p-4 flex flex-col">
            {/* Canvas area */}
            <div className="flex-1">
              {canvasMode === 'freeform' ? (
                <FreeformCanvas
                  layout={activePage?.layout ?? []}
                  onLayoutChange={handleLayoutChange}
                  isBuildMode={isBuildMode && !activeSnapshotDate}
                  mode={mode}
                  data={template.patientMode === 'roster'
                    ? (activeSlotId
                      ? (template.patientSlots?.find((s) => s.id === activeSlotId)?.data ?? {})
                      : {})
                    : template.singleData}
                  onDataChange={handleDataChange}
                  onAddModule={handleAddModule}
                />
              ) : canvasMode === 'sections' ? (
                <SectionsCanvas
                  layout={activePage?.layout ?? []}
                  sections={(activePage as TemplatePage & { sections?: CanvasSection[] }).sections ?? []}
                  onSectionsChange={handleSectionsChange}
                  isBuildMode={isBuildMode && !activeSnapshotDate}
                  mode={mode}
                  data={template.patientMode === 'roster'
                    ? (activeSlotId
                      ? (template.patientSlots?.find((s) => s.id === activeSlotId)?.data ?? {})
                      : {})
                    : template.singleData}
                  onDataChange={handleDataChange}
                />
              ) : (
                <GridCanvas
                  page={activePage ?? template.pages[0]}
                  mode={activeSnapshotDate ? 'live' : mode}
                  data={Object.fromEntries(
                    (activePage?.layout ?? []).map((inst) => [inst.instanceId, getInstanceData(inst.instanceId)])
                  )}
                  onPageChange={handlePageChange}
                  onDataChange={handleDataChange}
                  onAddModule={handleAddModule}
                />
              )}
            </div>

            {/* Snapshot timeline */}
            <SnapshotTimeline
              snapshots={template.snapshots ?? []}
              activeSnapshotDate={activeSnapshotDate}
              onSelectSnapshot={setActiveSnapshotDate}
            />
          </div>

          {isBuildMode && !activeSnapshotDate && (
            <ModulePalette onAddModule={handleAddModule} />
          )}
        </div>
      </div>
    </UndoRedoKeyHandler>
  )
}

// Feature 1: Keyboard handler component to avoid stale-closure issues
function UndoRedoKeyHandler({
  historyIndex,
  layoutHistory,
  activePage,
  onUndo,
  onRedo,
  mode,
  onShowCommandPalette,
  children,
}: {
  historyIndex: number
  layoutHistory: ModuleInstance[][]
  activePage: TemplatePage | undefined
  onUndo: () => void
  onRedo: () => void
  mode: AppMode
  onShowCommandPalette: (show: boolean) => void
  children: React.ReactNode
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key === 'k') {
        e.preventDefault()
        if (mode === 'build') {
          onShowCommandPalette(true)
        }
      } else if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        if (historyIndex > 0 && activePage) onUndo()
      } else if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        if (historyIndex < layoutHistory.length - 1 && activePage) onRedo()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [historyIndex, layoutHistory.length, activePage, onUndo, onRedo, mode, onShowCommandPalette])

  return <>{children}</>
}
