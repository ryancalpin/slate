import { useState, useEffect, useRef } from 'react'
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
  onClose: () => void
}

export function CommandPalette({ onAddModule, onClose }: Props) {
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const plugins = pluginRegistry.list()
  const term = search.trim().toLowerCase()

  const filtered: ModulePlugin[] = term
    ? plugins.filter(p =>
        p.meta.name.toLowerCase().includes(term) ||
        (p.meta.pack && (PACK_DISPLAY_NAMES[p.meta.pack] ?? p.meta.pack).toLowerCase().includes(term))
      )
    : plugins

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const plugin = filtered[selectedIndex]
      if (plugin) {
        onAddModule(plugin.meta.id, plugin.meta.version, plugin.defaultConfig)
      }
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const item = list.querySelector(`[data-index="${selectedIndex}"]`)
    if (item) {
      item.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/70"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
          <svg className="w-4 h-4 text-gray-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search modules to add…"
            className="flex-1 bg-transparent text-gray-100 text-sm placeholder-gray-500 outline-none"
          />
          <kbd className="text-gray-600 text-xs font-mono border border-gray-700 rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        {/* Results list */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <p className="text-gray-500 text-sm px-4 py-3">No modules found</p>
          )}
          {filtered.map((plugin, index) => (
            <button
              key={plugin.meta.id}
              data-index={index}
              onClick={() => onAddModule(plugin.meta.id, plugin.meta.version, plugin.defaultConfig)}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors ${
                index === selectedIndex
                  ? 'bg-accent/20 text-gray-100'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-gray-100'
              }`}
            >
              <span className="text-sm font-medium">{plugin.meta.name}</span>
              <span className="text-xs text-gray-500 ml-2 shrink-0">
                {plugin.meta.pack ? (PACK_DISPLAY_NAMES[plugin.meta.pack] ?? plugin.meta.pack) : 'Core'}
              </span>
            </button>
          ))}
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-800 flex items-center gap-3 text-xs text-gray-600">
            <span>↑↓ navigate</span>
            <span>↵ add module</span>
            <span>Esc close</span>
          </div>
        )}
      </div>
    </div>
  )
}
