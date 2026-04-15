import { useState } from 'react'
import { pluginRegistry } from '../../core/plugin/registry'
import type { ModulePlugin } from '../../core/plugin/types'

const PACK_DISPLAY_NAMES: Record<string, string> = {
  Core: 'Core',
  cardiology: 'Cardiology',
  pulm: 'Pulmonology',
  nephro: 'Nephrology',
  neuro: 'Neurology',
  id: 'Infectious Disease',
  icu: 'ICU / Critical Care',
  hemonc: 'Hematology / Oncology',
  gi: 'GI / Hepatology',
  endo: 'Endocrinology',
  surgery: 'Surgery',
  obgyn: 'OB / GYN',
  peds: 'Pediatrics',
}

interface Props {
  onAddModule: (moduleId: string, version: string, defaultConfig: Record<string, unknown>) => void
}

export function ModulePalette({ onAddModule }: Props) {
  const [search, setSearch] = useState('')

  const plugins = pluginRegistry.list()

  const groups = plugins.reduce<Record<string, ModulePlugin[]>>((acc, p) => {
    const key = p.meta.pack ?? 'Core'
    if (!acc[key]) acc[key] = []
    acc[key].push(p)
    return acc
  }, {})

  // Core first, then alphabetical by display name
  const sortedEntries = Object.entries(groups).sort(([a], [b]) => {
    if (a === 'Core') return -1
    if (b === 'Core') return 1
    return (PACK_DISPLAY_NAMES[a] ?? a).localeCompare(PACK_DISPLAY_NAMES[b] ?? b)
  })

  const term = search.trim().toLowerCase()

  const filteredEntries = sortedEntries
    .map(([groupKey, groupPlugins]) => {
      const matched = term
        ? groupPlugins.filter(p => p.meta.name.toLowerCase().includes(term))
        : groupPlugins
      return [groupKey, matched] as [string, ModulePlugin[]]
    })
    .filter(([, groupPlugins]) => groupPlugins.length > 0)

  const noResults = term.length > 0 && filteredEntries.length === 0

  return (
    <aside className="w-56 border-l border-gray-800 bg-[rgb(var(--color-surface-raised))] flex flex-col overflow-hidden shrink-0">
      <div className="px-3 py-2 border-b border-gray-800 text-xs font-semibold text-accent-DEFAULT uppercase tracking-wide">
        Modules
      </div>
      <div className="px-2 py-2 border-b border-gray-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search modules…"
            className="bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 px-2 py-1 w-full pr-6"
          />
          {search.length > 0 && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-1.5 text-gray-500 hover:text-gray-300 text-xs leading-none"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {filteredEntries.map(([groupKey, groupPlugins]) => (
          <div key={groupKey} className="mb-3">
            <div className="px-3 py-1 text-xs text-gray-500 uppercase tracking-wide">
              {PACK_DISPLAY_NAMES[groupKey] ?? groupKey}
            </div>
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
        {noResults && (
          <p className="text-xs text-gray-500 px-3">No results</p>
        )}
        {plugins.length === 0 && !term && (
          <p className="px-3 text-xs text-gray-600">No modules registered yet.</p>
        )}
      </div>
    </aside>
  )
}
