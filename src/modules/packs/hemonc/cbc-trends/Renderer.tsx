import type { FC } from 'react'

export interface CBCEntry {
  date: string
  wbc: number
  anc: number
  hgb: number
  plt: number
}

interface CBCData {
  entries: CBCEntry[]
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export function findNadir(values: number[]): { index: number; value: number } {
  if (values.length === 0) return { index: 0, value: 0 }
  let minIdx = 0
  let minVal = values[0]
  for (let i = 1; i < values.length; i++) {
    if (values[i] < minVal) {
      minVal = values[i]
      minIdx = i
    }
  }
  return { index: minIdx, value: minVal }
}

type Column = { key: keyof CBCEntry; label: string; unit: string }

const COLUMNS: Column[] = [
  { key: 'wbc', label: 'WBC', unit: '×10³/µL' },
  { key: 'anc', label: 'ANC', unit: '×10³/µL' },
  { key: 'hgb', label: 'Hgb', unit: 'g/dL' },
  { key: 'plt', label: 'Plt', unit: '×10³/µL' },
]

function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return null
  const max = Math.max(...values, 0.001)
  return (
    <div className="flex items-end gap-0.5 h-6">
      {values.map((v, i) => (
        <div
          key={i}
          className="w-2 bg-blue-400 rounded-t"
          style={{ height: `${Math.max(4, Math.round((v / max) * 24))}px` }}
        />
      ))}
    </div>
  )
}

export const CBCTrendsRenderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as unknown as CBCData
  const entries = d.entries ?? []

  const addRow = () => {
    const newEntry: CBCEntry = { date: '', wbc: 0, anc: 0, hgb: 0, plt: 0 }
    onDataChange({ ...d, entries: [...entries, newEntry] })
  }

  const removeRow = (idx: number) => {
    onDataChange({ ...d, entries: entries.filter((_, i) => i !== idx) })
  }

  const updateEntry = (idx: number, field: keyof CBCEntry, value: string | number) => {
    const updated = entries.map((e, i) => (i === idx ? { ...e, [field]: value } : e))
    onDataChange({ ...d, entries: updated })
  }

  // Compute nadir index for each numeric column
  const nadirMap: Record<string, number> = {}
  for (const col of COLUMNS) {
    const vals = entries.map(e => Number(e[col.key]))
    if (vals.length > 0) nadirMap[col.key] = findNadir(vals).index
  }

  // Recovery: last value > nadir value
  const recoveryMap: Record<string, boolean> = {}
  for (const col of COLUMNS) {
    if (entries.length < 2) { recoveryMap[col.key] = false; continue }
    const vals = entries.map(e => Number(e[col.key]))
    const { value: nadirVal } = findNadir(vals)
    recoveryMap[col.key] = vals[vals.length - 1] > nadirVal
  }

  return (
    <div className="p-3 space-y-3 overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-[420px]">
        <thead>
          <tr className="text-left text-gray-500 border-b text-xs">
            <th className="pb-1 pr-2">Date</th>
            {COLUMNS.map(col => (
              <th key={col.key} className="pb-1 pr-2">
                {col.label}
                <span className="ml-1 font-normal text-gray-400">{col.unit}</span>
                {recoveryMap[col.key] ? (
                  <span className="ml-1 text-green-500">↑</span>
                ) : null}
              </th>
            ))}
            {mode === 'build' ? <th /> : null}
          </tr>
          {/* Sparklines */}
          <tr className="border-b">
            <td />
            {COLUMNS.map(col => (
              <td key={col.key} className="pb-1 pr-2">
                <Sparkline values={entries.map(e => Number(e[col.key]))} />
              </td>
            ))}
            {mode === 'build' ? <td /> : null}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr key={idx} className="border-b last:border-0">
              {mode === 'build' ? (
                <>
                  <td className="py-1 pr-2">
                    <input
                      type="date"
                      className="border-b border-gray-200 focus:outline-none focus:border-blue-400 text-xs"
                      value={entry.date}
                      onChange={e => updateEntry(idx, 'date', e.target.value)}
                    />
                  </td>
                  {COLUMNS.map(col => (
                    <td key={col.key} className="py-1 pr-2">
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        className="w-16 border-b border-gray-200 focus:outline-none focus:border-blue-400 text-xs"
                        value={entry[col.key]}
                        onChange={e => updateEntry(idx, col.key, Number(e.target.value))}
                      />
                    </td>
                  ))}
                  <td className="py-1">
                    <button
                      onClick={() => removeRow(idx)}
                      className="text-red-400 hover:text-red-600 text-xs"
                      aria-label="Remove row"
                    >
                      ✕
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-1 pr-2 text-xs">{entry.date}</td>
                  {COLUMNS.map(col => {
                    const isNadir = nadirMap[col.key] === idx
                    return (
                      <td key={col.key} className={`py-1 pr-2 text-xs ${isNadir ? 'font-bold text-orange-600' : ''}`}>
                        {entry[col.key]}
                        {isNadir ? (
                          <span className="ml-1 text-[10px] bg-orange-100 text-orange-600 px-1 rounded">nadir</span>
                        ) : null}
                      </td>
                    )
                  })}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {mode === 'build' ? (
        <button
          onClick={addRow}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          + Add Row
        </button>
      ) : null}
    </div>
  )
}
