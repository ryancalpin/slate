// src/modules/custom-fields/Editor.tsx
import { useState, useCallback } from 'react'

interface FieldDef {
  id: string
  label: string
  type: 'text' | 'number' | 'checkbox' | 'dropdown' | 'date'
  options?: string[]
}

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

const FIELD_TYPES = ['text', 'number', 'checkbox', 'dropdown', 'date'] as const

function generateId() {
  return `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export function Editor({ config, onConfigChange }: Props) {
  const fields = (config.fields as FieldDef[]) ?? []

  const [newLabel, setNewLabel] = useState('')
  const [newType, setNewType] = useState<FieldDef['type']>('text')
  const [newOptions, setNewOptions] = useState('')
  const [adding, setAdding] = useState(false)

  const removeField = useCallback(
    (id: string) => {
      onConfigChange({ ...config, fields: fields.filter((f) => f.id !== id) })
    },
    [config, fields, onConfigChange]
  )

  const saveField = useCallback(() => {
    if (!newLabel.trim()) return
    const field: FieldDef = {
      id: generateId(),
      label: newLabel.trim(),
      type: newType,
      options:
        newType === 'dropdown'
          ? newOptions.split(',').map((o) => o.trim()).filter(Boolean)
          : undefined,
    }
    onConfigChange({ ...config, fields: [...fields, field] })
    setNewLabel('')
    setNewType('text')
    setNewOptions('')
    setAdding(false)
  }, [config, fields, newLabel, newType, newOptions, onConfigChange])

  return (
    <div className="space-y-3 p-3 text-sm">
      <p className="font-medium">Fields</p>
      <ul className="space-y-1">
        {fields.map((f) => (
          <li key={f.id} className="flex items-center gap-2 text-xs border rounded px-2 py-1">
            <span className="flex-1">{f.label}</span>
            <span className="text-gray-400">{f.type}</span>
            <button
              onClick={() => removeField(f.id)}
              className="text-red-400 hover:text-red-600"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      {adding ? (
        <div className="border rounded p-2 space-y-2 text-xs bg-gray-50 dark:bg-gray-900">
          <div>
            <label className="block font-medium mb-0.5">Field Name</label>
            <input
              className="border rounded px-2 py-1 w-full dark:bg-gray-800"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Admit Weight"
              autoFocus
            />
          </div>
          <div>
            <label className="block font-medium mb-0.5">Type</label>
            <select
              className="border rounded px-2 py-1 dark:bg-gray-800"
              value={newType}
              onChange={(e) => setNewType(e.target.value as FieldDef['type'])}
            >
              {FIELD_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {newType === 'dropdown' ? (
            <div>
              <label className="block font-medium mb-0.5">Options (comma-separated)</label>
              <textarea
                className="border rounded px-2 py-1 w-full dark:bg-gray-800 resize-none"
                rows={2}
                value={newOptions}
                onChange={(e) => setNewOptions(e.target.value)}
                placeholder="Option A, Option B, Option C"
              />
            </div>
          ) : null}
          <div className="flex gap-2">
            <button
              onClick={saveField}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => setAdding(false)}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          + Add Field
        </button>
      )}
    </div>
  )
}
