// src/modules/custom-fields/Renderer.tsx
import { useCallback } from 'react'

interface FieldDef {
  id: string
  label: string
  type: 'text' | 'number' | 'checkbox' | 'dropdown' | 'date'
  options?: string[]
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export function Renderer({ config, data, onDataChange, mode }: Props) {
  const fields = (config.fields as FieldDef[]) ?? []
  const values = (data.values as Record<string, string | number | boolean>) ?? {}

  const setValue = useCallback(
    (id: string, value: string | number | boolean) => {
      onDataChange({ ...data, values: { ...values, [id]: value } })
    },
    [data, values, onDataChange]
  )

  if (fields.length === 0) {
    return (
      <div className="p-3 text-sm text-gray-400 italic">
        No fields configured. Open settings to add fields.
      </div>
    )
  }

  return (
    <div className="p-2 space-y-2 text-sm">
      {fields.map((field) => (
        <div key={field.id} className="flex items-center gap-2">
          <label className="w-1/3 text-xs font-medium text-gray-600 dark:text-gray-400 shrink-0">
            {field.label}
          </label>
          {field.type === 'text' ? (
            <input
              type="text"
              className="flex-1 border rounded px-2 py-0.5 text-sm dark:bg-gray-800"
              value={(values[field.id] as string) ?? ''}
              onChange={(e) => setValue(field.id, e.target.value)}
              readOnly={mode === 'build'}
            />
          ) : field.type === 'number' ? (
            <input
              type="number"
              className="flex-1 border rounded px-2 py-0.5 text-sm dark:bg-gray-800"
              value={(values[field.id] as number) ?? ''}
              onChange={(e) => setValue(field.id, Number(e.target.value))}
              readOnly={mode === 'build'}
            />
          ) : field.type === 'checkbox' ? (
            <input
              type="checkbox"
              checked={(values[field.id] as boolean) ?? false}
              onChange={(e) => setValue(field.id, e.target.checked)}
              disabled={mode === 'build'}
            />
          ) : field.type === 'dropdown' ? (
            <select
              className="flex-1 border rounded px-2 py-0.5 text-sm dark:bg-gray-800"
              value={(values[field.id] as string) ?? ''}
              onChange={(e) => setValue(field.id, e.target.value)}
              disabled={mode === 'build'}
            >
              <option value="">—</option>
              {(field.options ?? []).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : field.type === 'date' ? (
            <input
              type="date"
              className="flex-1 border rounded px-2 py-0.5 text-sm dark:bg-gray-800"
              value={(values[field.id] as string) ?? ''}
              onChange={(e) => setValue(field.id, e.target.value)}
              readOnly={mode === 'build'}
            />
          ) : null}
        </div>
      ))}
    </div>
  )
}
