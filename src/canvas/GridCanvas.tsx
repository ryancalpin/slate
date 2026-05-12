import { useState } from 'react'
import { GridLayout, useContainerWidth } from 'react-grid-layout'
import type { Layout, LayoutItem } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { CanvasModule } from './CanvasModule'
import { pixelToGrid } from './canvasUtils'
import { ContextMenu } from '../ui/components/ContextMenu'
import type { TemplatePage, ModuleInstance, AppMode } from '../core/template/types'

const COLS = 12
const ROW_HEIGHT = 60
const MARGIN: readonly [number, number] = [8, 8]

interface Props {
  page: TemplatePage
  mode: AppMode
  data: Record<string, Record<string, unknown>>   // instanceId -> data
  onPageChange: (page: TemplatePage) => void
  onDataChange: (instanceId: string, data: Record<string, unknown>) => void
  onAddModule?: (moduleId: string, version: string, defaultConfig: Record<string, unknown>) => void
}

export function GridCanvas({ page, mode, data, onPageChange, onDataChange, onAddModule }: Props) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const { width, containerRef, mounted } = useContainerWidth({ initialWidth: 960 })

  const updateLayout = (updater: (layout: ModuleInstance[]) => ModuleInstance[]) => {
    onPageChange({ ...page, layout: updater(page.layout) })
  }

  const rglLayout: Layout = page.layout.map((inst): LayoutItem => ({
    i: inst.instanceId,
    x: inst.position.x,
    y: inst.position.y,
    w: inst.position.w,
    h: inst.position.h,
    isDraggable: mode === 'build' && !inst.locked,
    isResizable: mode === 'build' && !inst.locked,
  }))

  const handleLayoutChange = (newLayout: Layout) => {
    const updatedLayout = page.layout.map(inst => {
      const rgl = newLayout.find((l: LayoutItem) => l.i === inst.instanceId)
      if (!rgl) return inst
      return {
        ...inst,
        position: {
          x: rgl.x,
          y: rgl.y,
          w: rgl.w,
          h: rgl.h,
        },
      }
    })
    onPageChange({ ...page, layout: updatedLayout })
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

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto touch-manipulation"
      onContextMenu={mode === 'build' ? (e) => {
        e.preventDefault()
        setContextMenu({ x: e.clientX, y: e.clientY })
      } : undefined}
    >
      {page.layout.length === 0 && mode === 'build' && (
        <div className="flex flex-col items-center justify-center h-64 text-center select-none pointer-events-none gap-3">
          <div className="text-4xl">🧩</div>
          <p className="text-gray-400 text-sm font-medium">Your canvas is empty</p>
          <p className="text-gray-600 text-xs">Click a module in the panel to add it,<br/>right-click the canvas, or press <kbd className="px-1 py-0.5 rounded bg-gray-800 text-gray-400 font-mono text-xs">⌘K</kbd></p>
        </div>
      )}
      {mounted && (
        <GridLayout
          width={width}
          layout={rglLayout}
          gridConfig={{ cols: COLS, rowHeight: ROW_HEIGHT, margin: MARGIN, containerPadding: null, maxRows: Infinity }}
          dragConfig={{ enabled: mode === 'build', handle: '.drag-handle', bounded: false, cancel: 'button', threshold: 5 }}
          resizeConfig={{ enabled: mode === 'build' }}
          onLayoutChange={handleLayoutChange}
          autoSize
        >
          {page.layout.map(instance => (
            <div key={instance.instanceId}>
              <CanvasModule
                instance={instance}
                mode={mode}
                data={data[instance.instanceId] ?? {}}
                onDataChange={onDataChange}
                onConfigChange={handleConfigChange}
                onToggleLock={handleToggleLock}
                onToggleCollapse={handleToggleCollapse}
                onRemove={handleRemove}
              />
            </div>
          ))}
        </GridLayout>
      )}
      {contextMenu && mode === 'build' && onAddModule && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAddModule={onAddModule}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  )
}

// Re-export pixelToGrid so callers can use it if needed
export { pixelToGrid }
