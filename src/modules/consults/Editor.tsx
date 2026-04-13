// src/modules/consults/Editor.tsx
import { useCallback } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export function Editor({ config, onConfigChange }: Props) {
  const consultLabel = (config.consultLabel as string) ?? 'Active Consults'
  const resultsLabel = (config.resultsLabel as string) ?? 'Pending Results'

  const set = useCallback(
    (key: string, value: string) => onConfigChange({ ...config, [key]: value }),
    [config, onConfigChange]
  )

  return (
    <div className="space-y-3 p-3 text-sm">
      <div>
        <label className="block font-medium mb-1">Consults section label</label>
        <input
          className="border rounded px-2 py-1 w-full dark:bg-gray-800"
          value={consultLabel}
          onChange={(e) => set('consultLabel', e.target.value)}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Results section label</label>
        <input
          className="border rounded px-2 py-1 w-full dark:bg-gray-800"
          value={resultsLabel}
          onChange={(e) => set('resultsLabel', e.target.value)}
        />
      </div>
    </div>
  )
}
