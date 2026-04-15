import { useCallback, useRef } from 'react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  type DragEndEvent,
} from '@dnd-kit/core'
import { CanvasModule } from './CanvasModule'
import { freeformToPixel, pixelToFreeform } from './canvasUtils'
import type { ModuleInstance, AppMode, ModulePosition } from '../core/template/types'

interface FreeformCanvasProps {
  layout: ModuleInstance[]
  onLayoutChange: (updated: ModuleInstance[]) => void
  isBuildMode: boolean
  mode: AppMode
  data: Record<string, Record<string, unknown>>
  onDataChange: (instanceId: string, data: Record<string, unknown>) => void
  onAddModule?: (moduleId: string, version: string, defaultConfig: Record<string, unknown>) => void
}

interface DraggableModuleProps {
  instance: ModuleInstance
  isBuildMode: boolean
  mode: AppMode
  data: Record<string, unknown>
  onDataChange: (instanceId: string, data: Record<string, unknown>) => void
  onConfigChange: (instanceId: string, config: Record<string, unknown>) => void
  onToggleLock: (instanceId: string) => void
  onToggleCollapse: (instanceId: string) => void
  onRemove: (instanceId: string) => void
  onResize: (instanceId: string, position: ModulePosition) => void
}

function DraggableModule({
  instance,
  isBuildMode,
  mode,
  data,
  onDataChange,
  onConfigChange,
  onToggleLock,
  onToggleCollapse,
  onRemove,
  onResize,
}: DraggableModuleProps) {
  const { setNodeRef, transform } = useDraggable({
    id: instance.instanceId,
    disabled: !isBuildMode || instance.locked,
  })

  const pixelPos = freeformToPixel({ x: instance.position.x, y: instance.position.y })
  const style: React.CSSProperties = {
    position: 'absolute',
    left: pixelPos.left,
    top: pixelPos.top,
    width: `${instance.position.w * 80}px`,
    minHeight: `${instance.position.h * 60}px`,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <CanvasModule
        instance={instance}
        mode={mode}
        data={data}
        onDataChange={onDataChange}
        onConfigChange={onConfigChange}
        onToggleLock={onToggleLock}
        onToggleCollapse={onToggleCollapse}
        onRemove={onRemove}
        onResize={onResize}
      />
    </div>
  )
}

/**
 * Renders modules at arbitrary absolute pixel positions on an infinite canvas.
 * No grid snapping. Drag anywhere using dnd-kit useDraggable.
 * Positions are stored as pixel coordinates in ModuleInstance.position {x, y}.
 * w/h in freeform mode represent grid units used to derive pixel dimensions.
 */
export function FreeformCanvas({
  layout,
  onLayoutChange,
  isBuildMode,
  mode,
  data,
  onDataChange,
  onAddModule: _onAddModule,
}: FreeformCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event
      const updated = layout.map((inst) => {
        if (inst.instanceId !== active.id) return inst
        const newPos = pixelToFreeform(
          inst.position.x + delta.x,
          inst.position.y + delta.y,
        )
        return {
          ...inst,
          position: { ...inst.position, x: newPos.x, y: newPos.y },
        }
      })
      onLayoutChange(updated)
    },
    [layout, onLayoutChange],
  )

  const handleConfigChange = useCallback(
    (instanceId: string, config: Record<string, unknown>) => {
      onLayoutChange(layout.map((inst) =>
        inst.instanceId === instanceId ? { ...inst, config } : inst,
      ))
    },
    [layout, onLayoutChange],
  )

  const handleToggleLock = useCallback(
    (instanceId: string) => {
      onLayoutChange(layout.map((inst) =>
        inst.instanceId === instanceId ? { ...inst, locked: !inst.locked } : inst,
      ))
    },
    [layout, onLayoutChange],
  )

  const handleToggleCollapse = useCallback(
    (instanceId: string) => {
      onLayoutChange(layout.map((inst) =>
        inst.instanceId === instanceId ? { ...inst, collapsed: !inst.collapsed } : inst,
      ))
    },
    [layout, onLayoutChange],
  )

  const handleRemove = useCallback(
    (instanceId: string) => {
      onLayoutChange(layout.filter((inst) => inst.instanceId !== instanceId))
    },
    [layout, onLayoutChange],
  )

  const handleResize = useCallback(
    (instanceId: string, position: ModulePosition) => {
      onLayoutChange(layout.map((inst) =>
        inst.instanceId === instanceId ? { ...inst, position } : inst,
      ))
    },
    [layout, onLayoutChange],
  )

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ minHeight: '2000px' }}
        data-testid="freeform-canvas"
      >
        {layout.length === 0 && isBuildMode && (
          <div className="flex flex-col items-center justify-center h-64 text-center select-none pointer-events-none">
            <p className="text-gray-600 text-sm">Add a module from the panel →</p>
            <p className="text-gray-700 text-xs mt-1">Drag freely to position anywhere</p>
          </div>
        )}
        {layout.map((instance) => (
          <DraggableModule
            key={instance.instanceId}
            instance={instance}
            isBuildMode={isBuildMode}
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
    </DndContext>
  )
}
