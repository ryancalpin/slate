import { useParams } from 'react-router-dom'
import { useTemplate } from '../../hooks/useTemplate'
import { createModuleInstance } from '../../core/template/utils'
import { GridCanvas } from '../../canvas/GridCanvas'
import { ModulePalette } from '../shell/ModulePalette'
import type { AppMode, TemplatePage } from '../../core/template/types'

interface Props { mode: AppMode }

export function CanvasView({ mode }: Props) {
  const { id } = useParams<{ id: string }>()
  const { template, loading, saveTemplate } = useTemplate(id ?? null)

  if (loading) return <div className="p-8 text-gray-500 text-sm">Loading…</div>
  if (!template) return <div className="p-8 text-gray-500 text-sm">Template not found.</div>

  // Always show first page for now (multi-page in Plan 3)
  const page = template.pages[0]
  const data = template.singleData

  const handlePageChange = async (updated: TemplatePage) => {
    const updatedTemplate = {
      ...template,
      pages: template.pages.map(p => p.id === updated.id ? updated : p),
    }
    await saveTemplate(updatedTemplate)
  }

  const handleDataChange = async (instanceId: string, fieldData: Record<string, unknown>) => {
    const updatedData = { ...data, [instanceId]: fieldData }
    await saveTemplate({ ...template, singleData: updatedData })
  }

  const handleAddModule = async (moduleId: string, version: string, defaultConfig: Record<string, unknown>) => {
    // Place new modules at the top-left with a small offset based on count
    const offset = page.layout.length
    const instance = createModuleInstance(moduleId, version, {
      x: (offset * 2) % 10,
      y: Math.floor(offset / 5) * 4,
      w: 4,
      h: 3,
    }, defaultConfig)
    await handlePageChange({ ...page, layout: [...page.layout, instance] })
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-auto p-4">
        <GridCanvas
          page={page}
          mode={mode}
          data={data}
          onPageChange={handlePageChange}
          onDataChange={handleDataChange}
          onAddModule={handleAddModule}
        />
      </div>
      {mode === 'build' && (
        <ModulePalette onAddModule={handleAddModule} />
      )}
    </div>
  )
}
