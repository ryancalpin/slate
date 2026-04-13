// src/modules/lines-tubes/Editor.tsx
import { useCallback } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export function Editor({ config, onConfigChange }: Props) {
  const lineTypes = (config.lineTypes as string[]) ?? []
  const alertDays = (config.alertDays as number) ?? 5

  const addType = useCallback(() => {
    const type = prompt('New line type:')
    if (type && type.trim()) {
      onConfigChange({ ...config, lineTypes: [...lineTypes, type.trim()] })
    }
  }, [config, lineTypes, onConfigChange])

  const removeType = useCallback(
    (type: string) => {
      onConfigChange({ ...config, lineTypes: lineTypes.filter((t) => t !== type) })
    },
    [config, lineTypes, onConfigChange]
  )

  return (
    <div className="space-y-4 p-3 text-sm">
      <div>
        <label className="block font-medium mb-1">Alert threshold (days)</label>
        <input
          type="number"
          min={1}
          max={30}
          className="border rounded px-2 py-1 w-24 dark:bg-gray-800"
          value={alertDays}
          onChange={(e) =>
            onConfigChange({ ...config, alertDays: Number(e.target.value) })
          }
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Available line types</label>
        <ul className="space-y-1 mb-2">
          {lineTypes.map((t) => (
            <li key={t} className="flex items-center gap-2">
              <span className="flex-1">{t}</span>
              <button
                onClick={() => removeType(t)}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={addType}
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          + Add type
        </button>
      </div>
    </div>
  )
}
