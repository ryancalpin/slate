// src/modules/free-text/Editor.tsx
import { useCallback } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export function Editor({ config, onConfigChange }: Props) {
  const label = (config.label as string) ?? 'Notes'
  const fontSize = (config.fontSize as string) ?? 'base'
  const placeholder = (config.placeholder as string) ?? 'Enter notes here...'

  const set = useCallback(
    (key: string, value: string) => onConfigChange({ ...config, [key]: value }),
    [config, onConfigChange]
  )

  return (
    <div className="space-y-3 p-3 text-sm">
      <div>
        <label className="block font-medium mb-1">Label</label>
        <input
          className="border rounded px-2 py-1 w-full dark:bg-gray-800"
          value={label}
          onChange={(e) => set('label', e.target.value)}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Font size</label>
        <select
          className="border rounded px-2 py-1 dark:bg-gray-800"
          value={fontSize}
          onChange={(e) => set('fontSize', e.target.value)}
        >
          <option value="sm">Small</option>
          <option value="base">Medium</option>
          <option value="lg">Large</option>
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Placeholder text</label>
        <input
          className="border rounded px-2 py-1 w-full dark:bg-gray-800"
          value={placeholder}
          onChange={(e) => set('placeholder', e.target.value)}
        />
      </div>
    </div>
  )
}
