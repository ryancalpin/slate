import { useState, useEffect, useCallback } from 'react'
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

  if (loading) return <div className="p-8 text-gray-500 text-sm">Loading…</div>
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

  const handleDataChange = async (instanceId: string, fieldData: Record<string, unknown>) => {
    if (template.patientMode === 'roster') {
      await setSlotData(instanceId, fieldData)
    } else {
      const updatedData = { ...template.singleData, [instanceId]: fieldData }
      await saveTemplate({ ...template, singleData: updatedData })
    }
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
    await handlePageChange({ ...activePage, layout: [...activePage.layout, instance] })
  }

  const handleLayoutChange = async (updated: ModuleInstance[]) => {
    if (!activePage) return
    await handlePageChange({ ...activePage, layout: updated })
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
  )
}
