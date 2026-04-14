import React from 'react'

interface Antibiotic {
  agent: string
  dose: string
  route: string
  startDate: string
  durationDays: number
  renalAdjust: boolean
}

interface AntibioticData {
  antibiotics: Antibiotic[]
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

function calcDayNumber(startDate: string): number {
  if (!startDate) return 1
  // Use UTC dates to avoid timezone inconsistencies with ISO string inputs
  const start = new Date(startDate + 'T00:00:00Z')
  const todayStr = new Date().toISOString().split('T')[0]
  const today = new Date(todayStr + 'T00:00:00Z')
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return diff + 1
}

const ROUTES = ['IV', 'PO', 'IM']

const emptyAntibiotic = (): Antibiotic => ({
  agent: '',
  dose: '',
  route: 'IV',
  startDate: new Date().toISOString().split('T')[0],
  durationDays: 7,
  renalAdjust: false,
})

export function AntibioticRenderer({ data, onDataChange, mode }: Props) {
  const typedData = data as AntibioticData
  const antibiotics: Antibiotic[] = typedData.antibiotics ?? []

  function update(index: number, field: keyof Antibiotic, value: unknown) {
    const updated = antibiotics.map((ab, i) =>
      i === index ? { ...ab, [field]: value } : ab
    )
    onDataChange({ antibiotics: updated })
  }

  function addRow() {
    onDataChange({ antibiotics: [...antibiotics, emptyAntibiotic()] })
  }

  function removeRow(index: number) {
    onDataChange({ antibiotics: antibiotics.filter((_, i) => i !== index) })
  }

  return (
    <div className="overflow-x-auto p-2">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800 text-left">
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">Agent</th>
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">Dose</th>
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">Route</th>
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">Start Date</th>
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">Duration (d)</th>
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">Day #</th>
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">Renal Adj.</th>
            {mode === 'live' && (
              <th className="px-2 py-1 border border-gray-300 dark:border-gray-600"></th>
            )}
          </tr>
        </thead>
        <tbody>
          {antibiotics.map((ab, i) => (
            <tr key={i} className="even:bg-gray-50 dark:even:bg-gray-900">
              <td className="px-2 py-1 border border-gray-300 dark:border-gray-600">
                <input
                  className="w-full bg-transparent outline-none"
                  value={ab.agent}
                  onChange={e => update(i, 'agent', e.target.value)}
                  placeholder="Agent"
                />
              </td>
              <td className="px-2 py-1 border border-gray-300 dark:border-gray-600">
                <input
                  className="w-full bg-transparent outline-none"
                  value={ab.dose}
                  onChange={e => update(i, 'dose', e.target.value)}
                  placeholder="Dose"
                />
              </td>
              <td className="px-2 py-1 border border-gray-300 dark:border-gray-600">
                <select
                  className="bg-transparent outline-none"
                  value={ab.route}
                  onChange={e => update(i, 'route', e.target.value)}
                >
                  {ROUTES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </td>
              <td className="px-2 py-1 border border-gray-300 dark:border-gray-600">
                <input
                  type="date"
                  className="bg-transparent outline-none"
                  value={ab.startDate}
                  onChange={e => update(i, 'startDate', e.target.value)}
                />
              </td>
              <td className="px-2 py-1 border border-gray-300 dark:border-gray-600">
                <input
                  type="number"
                  className="w-16 bg-transparent outline-none"
                  value={ab.durationDays}
                  min={1}
                  onChange={e => update(i, 'durationDays', Number(e.target.value))}
                />
              </td>
              <td className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-center font-medium">
                {calcDayNumber(ab.startDate)}
              </td>
              <td className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-center">
                <input
                  type="checkbox"
                  checked={ab.renalAdjust}
                  onChange={e => update(i, 'renalAdjust', e.target.checked)}
                />
              </td>
              {mode === 'live' && (
                <td className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-center">
                  <button
                    className="text-red-500 hover:text-red-700 text-xs"
                    onClick={() => removeRow(i)}
                    aria-label="Remove row"
                  >
                    ✕
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {mode === 'live' && (
        <button
          className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={addRow}
        >
          + Add Antibiotic
        </button>
      )}
    </div>
  )
}
