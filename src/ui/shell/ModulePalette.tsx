import { pluginRegistry } from '../../core/plugin/registry'
import type { ModulePlugin } from '../../core/plugin/types'

interface Props {
  onAddModule: (moduleId: string, version: string, defaultConfig: Record<string, unknown>) => void
}

export function ModulePalette({ onAddModule }: Props) {
  const plugins = pluginRegistry.list()

  // Group by pack, ungrouped modules under "Core"
  const groups = plugins.reduce<Record<string, ModulePlugin[]>>((acc, p) => {
    const key = p.meta.pack ?? 'Core'
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  return (
    <aside className="w-56 border-l border-gray-800 bg-[rgb(var(--color-surface-raised))] flex flex-col overflow-hidden shrink-0">
      <div className="px-3 py-2 border-b border-gray-800 text-xs font-semibold text-accent-DEFAULT uppercase tracking-wide">
        Modules
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {Object.entries(groups).map(([groupName, groupPlugins]) => (
          <div key={groupName} className="mb-3">
            <div className="px-3 py-1 text-xs text-gray-500 uppercase tracking-wide">{groupName}</div>
            {groupPlugins.map(plugin => (
              <button
                key={plugin.meta.id}
                onClick={() => onAddModule(plugin.meta.id, plugin.meta.version, plugin.defaultConfig)}
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-gray-100 transition-colors"
              >
                {plugin.meta.name}
              </button>
            ))}
          </div>
        ))}
        {plugins.length === 0 && (
          <p className="px-3 text-xs text-gray-600">No modules registered yet.</p>
        )}
      </div>
    </aside>
  )
}
