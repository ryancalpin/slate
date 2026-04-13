import { useState, type CSSProperties } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { gridToPixel } from './canvasUtils'
import { ResizeHandle } from './ResizeHandle'
import { pluginRegistry } from '../core/plugin/registry'
import type { ModuleInstance, AppMode, ModulePosition } from '../core/template/types'

interface Props {
  instance: ModuleInstance
  mode: AppMode
  data: Record<string, unknown>
  onDataChange: (instanceId: string, data: Record<string, unknown>) => void
  onConfigChange: (instanceId: string, config: Record<string, unknown>) => void
  onToggleLock: (instanceId: string) => void
  onToggleCollapse: (instanceId: string) => void
  onRemove: (instanceId: string) => void
  onResize: (instanceId: string, position: ModulePosition) => void
}

export function CanvasModule({
  instance, mode, data, onDataChange, onConfigChange,
  onToggleLock, onToggleCollapse, onRemove, onResize,
}: Props) {
  // All hooks must be called before any early return (Rules of Hooks)
  const [showEditor, setShowEditor] = useState(false)
  const plugin = pluginRegistry.get(instance.moduleId)
  const isDraggable = mode === 'build' && !instance.locked

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: instance.instanceId,
    disabled: !isDraggable,
  })

  const style: CSSProperties = {
    ...gridToPixel(instance.position),
    ...(transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : {}),
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
    transition: isDragging ? 'none' : 'box-shadow 0.15s',
  }

  if (!plugin) {
    return (
      <div style={style} className="absolute bg-red-900 border border-red-700 rounded p-2 text-xs text-red-300">
        Unknown module: {instance.moduleId}
      </div>
    )
  }

  const { Renderer, Editor } = plugin

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`absolute flex flex-col group bg-[rgb(var(--color-surface-raised))] border rounded overflow-hidden ${
        isDragging ? 'shadow-2xl border-accent-DEFAULT' : 'border-gray-800 hover:border-gray-600'
      } ${instance.locked ? 'border-yellow-800' : ''}`}
    >
      {/* Module header */}
      <div
        className="flex items-center justify-between px-2 py-1 bg-black/20 shrink-0 select-none"
        {...(isDraggable ? { ...attributes, ...listeners, style: { cursor: 'grab' } } : {})}
      >
        <span className="text-xs font-semibold text-accent-DEFAULT truncate">{plugin.meta.name.toUpperCase()}</span>
        {mode === 'build' ? (
          <div className="flex gap-1 ml-2 shrink-0">
            <button onClick={() => setShowEditor(v => !v)} title="Configure" className="text-gray-500 hover:text-gray-300 text-xs px-1">⚙️</button>
            <button onClick={() => onToggleLock(instance.instanceId)} title={instance.locked ? 'Unlock' : 'Lock'} className="text-gray-500 hover:text-gray-300 text-xs px-1">
              {instance.locked ? '🔒' : '🔓'}
            </button>
            <button onClick={() => onToggleCollapse(instance.instanceId)} title="Collapse" className="text-gray-500 hover:text-gray-300 text-xs px-1">
              {instance.collapsed ? '▼' : '▲'}
            </button>
            <button onClick={() => onRemove(instance.instanceId)} title="Remove" className="text-gray-500 hover:text-red-400 text-xs px-1">✕</button>
          </div>
        ) : (
          <button onClick={() => onToggleCollapse(instance.instanceId)} className="text-gray-600 hover:text-gray-400 text-xs px-1">
            {instance.collapsed ? '▼' : '▲'}
          </button>
        )}
      </div>

      {/* Module body */}
      {!instance.collapsed && (
        <div className="flex-1 overflow-auto p-2">
          {showEditor && mode === 'build' ? (
            <Editor
              config={instance.config}
              onConfigChange={cfg => { onConfigChange(instance.instanceId, cfg); setShowEditor(false) }}
            />
          ) : (
            <Renderer
              instanceId={instance.instanceId}
              config={instance.config}
              data={data}
              onDataChange={d => onDataChange(instance.instanceId, d)}
              mode={mode}
            />
          )}
        </div>
      )}

      {mode === 'build' && !instance.locked && (
        <ResizeHandle
          position={instance.position}
          minW={plugin.minSize.w}
          minH={plugin.minSize.h}
          onResize={newPos => onResize(instance.instanceId, newPos)}
        />
      )}
    </div>
  )
}
