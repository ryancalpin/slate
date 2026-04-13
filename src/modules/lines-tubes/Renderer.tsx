// src/modules/lines-tubes/Renderer.tsx
import { useState, useCallback } from 'react'

interface Line {
  id: string
  type: string
  site: string
  insertionDate: string
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

function daysIn(insertionDate: string): number {
  if (!insertionDate) return 0
  const diff = Date.now() - new Date(insertionDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function Renderer({ config, data, onDataChange, mode }: Props) {
  const lineTypes = (config.lineTypes as string[]) ?? []
  const alertDays = (config.alertDays as number) ?? 5
  const lines = (data.lines as Line[]) ?? []

  const [nextId, setNextId] = useState(lines.length + 1)

  const updateLine = useCallback(
    (id: string, field: keyof Line, value: string) => {
      onDataChange({
        ...data,
        lines: lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
      })
    },
    [data, lines, onDataChange]
  )

  const addLine = useCallback(() => {
    const id = String(nextId)
    setNextId((n) => n + 1)
    onDataChange({
      ...data,
      lines: [
        ...lines,
        { id, type: lineTypes[0] ?? '', site: '', insertionDate: '' },
      ],
    })
  }, [data, lines, lineTypes, nextId, onDataChange])

  const deleteLine = useCallback(
    (id: string) => {
      onDataChange({ ...data, lines: lines.filter((l) => l.id !== id) })
    },
    [data, lines, onDataChange]
  )

  if (mode === 'build') {
    return (
      <div className="p-3 text-sm text-gray-500 italic">
        Lines / Tubes / Drains
        <p className="text-xs mt-1">Table with Type, Site, Insertion Date, Days In columns.</p>
      </div>
    )
  }

  return (
    <div className="p-2 overflow-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800 text-left">
            <th className="p-1 border border-gray-200 dark:border-gray-700">Type</th>
            <th className="p-1 border border-gray-200 dark:border-gray-700">Site</th>
            <th className="p-1 border border-gray-200 dark:border-gray-700">Insertion Date</th>
            <th className="p-1 border border-gray-200 dark:border-gray-700">Days In</th>
            <th className="p-1 border border-gray-200 dark:border-gray-700 w-8"></th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => {
            const days = daysIn(line.insertionDate)
            const amber = line.insertionDate && days > alertDays
            return (
              <tr
                key={line.id}
                className={amber ? 'bg-amber-50 dark:bg-amber-900/20' : ''}
              >
                <td className="p-1 border border-gray-200 dark:border-gray-700">
                  <select
                    className="w-full bg-transparent text-sm"
                    value={line.type}
                    onChange={(e) => updateLine(line.id, 'type', e.target.value)}
                  >
                    {lineTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </td>
                <td className="p-1 border border-gray-200 dark:border-gray-700">
                  <input
                    className="w-full bg-transparent text-sm"
                    value={line.site}
                    onChange={(e) => updateLine(line.id, 'site', e.target.value)}
                    placeholder="Site"
                  />
                </td>
                <td className="p-1 border border-gray-200 dark:border-gray-700">
                  <input
                    type="date"
                    className="w-full bg-transparent text-sm"
                    value={line.insertionDate}
                    onChange={(e) => updateLine(line.id, 'insertionDate', e.target.value)}
                  />
                </td>
                <td className="p-1 border border-gray-200 dark:border-gray-700 text-center font-mono">
                  {line.insertionDate ? days : '—'}
                </td>
                <td className="p-1 border border-gray-200 dark:border-gray-700 text-center">
                  <button
                    onClick={() => deleteLine(line.id)}
                    className="text-red-400 hover:text-red-600 text-xs"
                    aria-label="Delete line"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <button
        onClick={addLine}
        className="mt-2 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
      >
        + Add Line
      </button>
    </div>
  )
}
