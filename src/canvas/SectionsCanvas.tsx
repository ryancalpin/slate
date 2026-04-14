import { useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CanvasModule } from './CanvasModule'
import type { ModuleInstance, AppMode, ModulePosition } from '../core/template/types'

export interface CanvasSection {
  id: string
  name: string
  instanceIds: string[]
}

interface SectionsCanvasProps {
  layout: ModuleInstance[]
  sections: CanvasSection[]
  onSectionsChange: (sections: CanvasSection[]) => void
  isBuildMode: boolean
  mode: AppMode
  data: Record<string, Record<string, unknown>>
  onDataChange: (instanceId: string, data: Record<string, unknown>) => void
}

interface SortableSectionProps {
  section: CanvasSection
  instances: ModuleInstance[]
  isBuildMode: boolean
  mode: AppMode
  data: Record<string, Record<string, unknown>>
  onDataChange: (instanceId: string, data: Record<string, unknown>) => void
  onLayoutChange: (updater: (layout: ModuleInstance[]) => ModuleInstance[]) => void
}

function SortableSection({
  section,
  instances,
  isBuildMode,
  mode,
  data,
  onDataChange,
  onLayoutChange,
}: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    disabled: !isBuildMode,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleConfigChange = (instanceId: string, config: Record<string, unknown>) => {
    onLayoutChange((layout) =>
      layout.map((inst) => (inst.instanceId === instanceId ? { ...inst, config } : inst)),
    )
  }

  const handleToggleLock = (instanceId: string) => {
    onLayoutChange((layout) =>
      layout.map((inst) =>
        inst.instanceId === instanceId ? { ...inst, locked: !inst.locked } : inst,
      ),
    )
  }

  const handleToggleCollapse = (instanceId: string) => {
    onLayoutChange((layout) =>
      layout.map((inst) =>
        inst.instanceId === instanceId ? { ...inst, collapsed: !inst.collapsed } : inst,
      ),
    )
  }

  const handleRemove = (instanceId: string) => {
    onLayoutChange((layout) => layout.filter((inst) => inst.instanceId !== instanceId))
  }

  const handleResize = (instanceId: string, position: ModulePosition) => {
    onLayoutChange((layout) =>
      layout.map((inst) => (inst.instanceId === instanceId ? { ...inst, position } : inst)),
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-700 rounded-lg overflow-hidden"
    >
      {/* Section header */}
      <div
        className="flex items-center gap-2 px-4 py-2 bg-surface-raised border-b border-gray-700"
        {...(isBuildMode ? { ...attributes, ...listeners } : {})}
      >
        {isBuildMode && (
          <span className="text-gray-500 cursor-grab" aria-hidden>⠿</span>
        )}
        <span className="text-sm font-medium text-white">{section.name}</span>
      </div>

      {/* Module row */}
      <div className="flex flex-wrap gap-3 p-3">
        {instances.map((inst) => (
          <div
            key={inst.instanceId}
            className="min-w-[200px] flex-1"
          >
            <CanvasModule
              instance={inst}
              mode={mode}
              data={data[inst.instanceId] ?? {}}
              onDataChange={onDataChange}
              onConfigChange={handleConfigChange}
              onToggleLock={handleToggleLock}
              onToggleCollapse={handleToggleCollapse}
              onRemove={handleRemove}
              onResize={handleResize}
            />
          </div>
        ))}
        {instances.length === 0 && (
          <p className="text-xs text-gray-600 py-4 px-2">No modules in this section</p>
        )}
      </div>
    </div>
  )
}

/**
 * Renders modules in named vertical sections. Each section contains a
 * flex-row of modules. Sections can be reordered by drag (dnd-kit Sortable)
 * in Build Mode.
 *
 * Sections data is stored per page. When sections is empty,
 * all layout instances are placed in a default "Main" section.
 */
export function SectionsCanvas({
  layout,
  sections: rawSections,
  onSectionsChange,
  isBuildMode,
  mode,
  data,
  onDataChange,
}: SectionsCanvasProps) {
  // Default section if none defined
  const sections: CanvasSection[] =
    rawSections.length > 0
      ? rawSections
      : [{ id: 'default', name: 'Main', instanceIds: layout.map((l) => l.instanceId) }]

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = sections.findIndex((s) => s.id === active.id)
      const newIndex = sections.findIndex((s) => s.id === over.id)
      onSectionsChange(arrayMove(sections, oldIndex, newIndex))
    },
    [sections, onSectionsChange],
  )

  // Sections can only change their order, not the layout instances
  const handleLayoutChange = useCallback(
    (updater: (layout: ModuleInstance[]) => ModuleInstance[]) => {
      // Layout changes propagate up through the page — not handled here directly
      // This is a no-op for sections canvas as layout changes go through onDataChange
      void updater
    },
    [],
  )

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-4 p-4" data-testid="sections-canvas">
          {sections.map((section) => {
            const instances = section.instanceIds
              .map((id) => layout.find((l) => l.instanceId === id))
              .filter(Boolean) as ModuleInstance[]
            return (
              <SortableSection
                key={section.id}
                section={section}
                instances={instances}
                isBuildMode={isBuildMode}
                mode={mode}
                data={data}
                onDataChange={onDataChange}
                onLayoutChange={handleLayoutChange}
              />
            )
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}
