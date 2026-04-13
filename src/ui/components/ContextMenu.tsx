import { useEffect, useRef } from 'react'
import { pluginRegistry } from '../../core/plugin/registry'

interface Props {
  x: number
  y: number
  onAddModule: (moduleId: string, version: string, defaultConfig: Record<string, unknown>) => void
  onClose: () => void
}

export function ContextMenu({ x, y, onAddModule, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const plugins = pluginRegistry.list()

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', left: x, top: y, zIndex: 100 }}
      className="bg-[rgb(var(--color-surface-raised))] border border-gray-700 rounded shadow-xl py-1 min-w-[180px] max-h-80 overflow-y-auto"
    >
      <div className="px-3 py-1 text-xs text-gray-500 font-semibold uppercase tracking-wide">Add Module</div>
      {plugins.map(plugin => (
        <button
          key={plugin.meta.id}
          className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100"
          onClick={() => { onAddModule(plugin.meta.id, plugin.meta.version, plugin.defaultConfig); onClose() }}
        >
          {plugin.meta.name}
        </button>
      ))}
    </div>
  )
}
