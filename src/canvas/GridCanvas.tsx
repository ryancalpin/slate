import { useState, useRef } from 'react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { CanvasModule } from './CanvasModule'
import { pixelToGrid, clampToGrid, GRID_ROW_HEIGHT, GRID_COL_WIDTH, GRID_GAP } from './canvasUtils'
import { ContextMenu } from '../ui/components/ContextMenu'
import type { TemplatePage, ModuleInstance, AppMode, ModulePosition } from '../core/template/types'

interface Props {
  page: TemplatePage
  mode: AppMode
  data: Record<string, Record<string, unknown>>   // instanceId -> data
  onPageChange: (page: TemplatePage) => void
  onDataChange: (instanceId: string, data: Record<string, unknown>) => void
  onAddModule?: (moduleId: string, version: string, defaultConfig: Record<string, unknown>) => void
}

export function GridCanvas({ page, mode, data, onPageChange, onDataChange, onAddModule }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const updateLayout = (updater: (layout: ModuleInstance[]) => ModuleInstance[]) => {
    onPageChange({ ...page, layout: updater(page.layout) })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event
    if (!delta) return

    updateLayout(layout =>
      layout.map(inst => {
        if (inst.instanceId !== active.id || inst.locked) return inst
        const deltaGridX = Math.round(delta.x / (GRID_COL_WIDTH + GRID_GAP))
        const deltaGridY = Math.round(delta.y / (GRID_ROW_HEIGHT + GRID_GAP))
        return {
          ...inst,
          position: clampToGrid({
            ...inst.position,
            x: inst.position.x + deltaGridX,
            y: inst.position.y + deltaGridY,
          }),
        }
      })
    )
  }

  const handleToggleLock = (instanceId: string) => {
    updateLayout(layout =>
      layout.map(inst =>
        inst.instanceId === instanceId ? { ...inst, locked: !inst.locked } : inst
      )
    )
  }

  const handleToggleCollapse = (instanceId: string) => {
    updateLayout(layout =>
      layout.map(inst =>
        inst.instanceId === instanceId ? { ...inst, collapsed: !inst.collapsed } : inst
      )
    )
  }

  const handleRemove = (instanceId: string) => {
    updateLayout(layout => layout.filter(inst => inst.instanceId !== instanceId))
  }

  const handleConfigChange = (instanceId: string, config: Record<string, unknown>) => {
    updateLayout(layout =>
      layout.map(inst =>
        inst.instanceId === instanceId ? { ...inst, config } : inst
      )
    )
  }

  const handleResize = (instanceId: string, position: ModulePosition) => {
    updateLayout(layout =>
      layout.map(inst =>
        inst.instanceId === instanceId ? { ...inst, position: clampToGrid(position) } : inst
      )
    )
  }

  // Canvas height: enough to fit all modules plus scrolling room
  const maxBottom = page.layout.reduce(
    (max, inst) => Math.max(max, inst.position.y + inst.position.h),
    0
  )
  const canvasHeight = Math.max(600, (maxBottom + 4) * (GRID_ROW_HEIGHT + GRID_GAP))

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        ref={canvasRef}
        className="relative w-full overflow-auto"
        style={{ height: canvasHeight }}
        onContextMenu={mode === 'build' ? (e) => {
          e.preventDefault()
          setContextMenu({ x: e.clientX, y: e.clientY })
        } : undefined}
      >
        {page.layout.length === 0 && mode === 'build' && (
          <div className="flex flex-col items-center justify-center h-64 text-center select-none pointer-events-none">
            <p className="text-gray-600 text-sm">Add a module from the panel →</p>
            <p className="text-gray-700 text-xs mt-1">Drag to reposition, drag corner to resize</p>
          </div>
        )}
        {page.layout.map(instance => (
          <CanvasModule
            key={instance.instanceId}
            instance={instance}
            mode={mode}
            data={data[instance.instanceId] ?? {}}
            onDataChange={onDataChange}
            onConfigChange={handleConfigChange}
            onToggleLock={handleToggleLock}
            onToggleCollapse={handleToggleCollapse}
            onRemove={handleRemove}
            onResize={handleResize}
          />
        ))}
      </div>
      {contextMenu && mode === 'build' && onAddModule && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAddModule={onAddModule}
          onClose={() => setContextMenu(null)}
        />
      )}
    </DndContext>
  )
}

// Re-export pixelToGrid so callers can use it if needed
export { pixelToGrid }
