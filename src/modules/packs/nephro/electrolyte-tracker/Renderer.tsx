import { FC } from 'react'

interface Entry {
  date: string
  na: number; k: number; cl: number; hco3: number
  bun: number; cr: number; ca: number; mg: number; phos: number
}

interface TrackerData { entries: Entry[] }

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

type ElectrolyteKey = 'na' | 'k' | 'cl' | 'hco3' | 'bun' | 'cr' | 'ca' | 'mg' | 'phos'

const COLUMNS: { key: ElectrolyteKey; label: string; range: string; min: number; max: number }[] = [
  { key: 'na',   label: 'Na',   range: '136-145', min: 136,  max: 145  },
  { key: 'k',    label: 'K',    range: '3.5-5.0', min: 3.5,  max: 5.0  },
  { key: 'cl',   label: 'Cl',   range: '98-107',  min: 98,   max: 107  },
  { key: 'hco3', label: 'HCO3', range: '22-29',   min: 22,   max: 29   },
  { key: 'bun',  label: 'BUN',  range: '7-25',    min: 7,    max: 25   },
  { key: 'cr',   label: 'Cr',   range: '0.6-1.2', min: 0.6,  max: 1.2  },
  { key: 'ca',   label: 'Ca',   range: '8.5-10.5',min: 8.5,  max: 10.5 },
  { key: 'mg',   label: 'Mg',   range: '1.7-2.2', min: 1.7,  max: 2.2  },
  { key: 'phos', label: 'Phos', range: '2.5-4.5', min: 2.5,  max: 4.5  },
]

function isOutOfRange(key: ElectrolyteKey, value: number): boolean {
  const col = COLUMNS.find(c => c.key === key)!
  return value < col.min || value > col.max
}

/** Simple sparkline: renders up to 8 bars scaled to min-max of the series */
function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return (
    <div className="flex items-end gap-px h-5 w-20 mt-1">
      {values.slice(-8).map((v, i) => {
        const pct = ((v - min) / range) * 100
        return (
          <div
            key={i}
            className="flex-1 bg-blue-400 dark:bg-blue-500 rounded-sm"
            style={{ height: `${Math.max(pct, 8)}%` }}
          />
        )
      })}
    </div>
  )
}

function makeBlankEntry(): Entry {
  return {
    date: new Date().toISOString().slice(0, 10),
    na: 0, k: 0, cl: 0, hco3: 0, bun: 0, cr: 0, ca: 0, mg: 0, phos: 0,
  }
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as unknown as TrackerData
  const disabled = mode === 'build'

  function updateEntry(idx: number, key: ElectrolyteKey | 'date', value: string | number) {
    const entries = d.entries.map((e, i) =>
      i === idx ? { ...e, [key]: value } : e
    )
    onDataChange({ ...d, entries } as unknown as Record<string, unknown>)
  }

  function addRow() {
    onDataChange({ ...d, entries: [...d.entries, makeBlankEntry()] } as unknown as Record<string, unknown>)
  }

  return (
    <div className="p-2 overflow-x-auto">
      <table className="text-xs w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left pr-2 pb-1 text-gray-500 font-medium">Date</th>
            {COLUMNS.map(col => (
              <th key={col.key} className="text-center px-1 pb-1 text-gray-600 dark:text-gray-300 font-semibold">
                <div>{col.label}</div>
                <div className="text-gray-400 font-normal">{col.range}</div>
                <Sparkline values={d.entries.map(e => e[col.key])} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {d.entries.map((entry, idx) => (
            <tr key={idx} className="border-t border-gray-200 dark:border-gray-700">
              <td className="pr-2 py-0.5">
                <input
                  type="date"
                  value={entry.date}
                  disabled={disabled}
                  onChange={e => updateEntry(idx, 'date', e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded px-1 text-xs bg-white dark:bg-gray-800"
                />
              </td>
              {COLUMNS.map(col => {
                const val = entry[col.key]
                const oob = val !== 0 && isOutOfRange(col.key, val)
                return (
                  <td key={col.key} className="px-1 py-0.5 text-center">
                    <input
                      type="number"
                      step="0.1"
                      value={val || ''}
                      disabled={disabled}
                      onChange={e => updateEntry(idx, col.key, parseFloat(e.target.value) || 0)}
                      className={`w-14 border rounded px-1 text-xs text-center bg-white dark:bg-gray-800 ${
                        oob
                          ? 'border-red-400 text-red-600 font-semibold'
                          : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100'
                      }`}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={addRow}
        disabled={disabled}
        className="mt-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-40"
      >
        + Add Row
      </button>
    </div>
  )
}
