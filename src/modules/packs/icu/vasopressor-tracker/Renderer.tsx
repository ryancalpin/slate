import type { FC } from 'react'

const AGENTS = [
  'norepinephrine',
  'epinephrine',
  'vasopressin',
  'dopamine',
  'phenylephrine',
  'angiotensin-II',
  'dobutamine',
] as const

type Unit = 'mcg/kg/min' | 'units/min'

interface Pressor {
  agent: string
  dose: number
  unit: Unit
  mapTarget: number
}

interface MapReading {
  timestamp: string
  map: number
}

interface VasopressorData {
  pressors: Pressor[]
  mapReadings: MapReading[]
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

function getTrend(readings: MapReading[]): '↑' | '↓' | '→' | null {
  if (readings.length < 2) return null
  const sorted = [...readings].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const last = sorted[sorted.length - 1].map
  const prev = sorted[sorted.length - 2].map
  if (last > prev) return '↑'
  if (last < prev) return '↓'
  return '→'
}

const defaultPressor = (): Pressor => ({
  agent: 'norepinephrine',
  dose: 0,
  unit: 'mcg/kg/min',
  mapTarget: 65,
})

export const VasopressorRenderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const typedData = data as unknown as VasopressorData
  const pressors: Pressor[] = typedData.pressors ?? []
  const mapReadings: MapReading[] = typedData.mapReadings ?? []
  const trend = getTrend(mapReadings)
  const latestMap = mapReadings.length
    ? [...mapReadings].sort((a, b) => a.timestamp.localeCompare(b.timestamp)).slice(-1)[0].map
    : null

  const updatePressor = (index: number, field: keyof Pressor, value: string | number) => {
    const updated = pressors.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    onDataChange({ ...typedData, pressors: updated })
  }

  const addPressor = () => {
    onDataChange({ ...typedData, pressors: [...pressors, defaultPressor()] })
  }

  const removePressor = (index: number) => {
    onDataChange({ ...typedData, pressors: pressors.filter((_, i) => i !== index) })
  }

  const addMapReading = (value: number) => {
    const reading: MapReading = { timestamp: new Date().toISOString(), map: value }
    onDataChange({ ...typedData, mapReadings: [...mapReadings, reading] })
  }

  const trendColor =
    trend === '↑' ? 'text-green-400' : trend === '↓' ? 'text-red-400' : 'text-gray-400'

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-200">Vasopressor Tracker</h3>
        <div className="flex items-center gap-3">
          {latestMap !== null && (
            <span className="text-sm text-gray-300">
              MAP: <strong>{latestMap}</strong>{' '}
              {trend && <span className={`text-lg font-bold ${trendColor}`}>{trend}</span>}
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-600 text-gray-400">
              <th className="text-left py-1 pr-2">Agent</th>
              <th className="text-left py-1 pr-2">Dose</th>
              <th className="text-left py-1 pr-2">Unit</th>
              <th className="text-left py-1 pr-2">MAP Target</th>
              {mode === 'live' && <th className="text-left py-1 pr-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {pressors.map((pressor, i) => (
              <tr key={i} className="border-b border-gray-700">
                <td className="py-1 pr-2">
                  {mode === 'build' ? (
                    <span className="text-xs text-gray-200">{pressor.agent}</span>
                  ) : (
                    <select
                      value={pressor.agent}
                      onChange={(e) => updatePressor(i, 'agent', e.target.value)}
                      className="bg-gray-800 text-gray-100 rounded px-1 py-0.5 text-xs w-full"
                    >
                      {AGENTS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="py-1 pr-2">
                  <input
                    type="number"
                    value={pressor.dose}
                    onChange={(e) => updatePressor(i, 'dose', parseFloat(e.target.value) || 0)}
                    className="bg-gray-800 text-gray-100 rounded px-1 py-0.5 text-xs w-20"
                    step="0.01"
                    min="0"
                    disabled={mode === 'build'}
                  />
                </td>
                <td className="py-1 pr-2">
                  <select
                    value={pressor.unit}
                    onChange={(e) => updatePressor(i, 'unit', e.target.value as Unit)}
                    className="bg-gray-800 text-gray-100 rounded px-1 py-0.5 text-xs"
                    disabled={mode === 'build'}
                  >
                    <option value="mcg/kg/min">mcg/kg/min</option>
                    <option value="units/min">units/min</option>
                  </select>
                </td>
                <td className="py-1 pr-2">
                  <input
                    type="number"
                    value={pressor.mapTarget}
                    onChange={(e) => updatePressor(i, 'mapTarget', parseInt(e.target.value) || 65)}
                    className="bg-gray-800 text-gray-100 rounded px-1 py-0.5 text-xs w-16"
                    min="40"
                    max="110"
                    disabled={mode === 'build'}
                  />
                </td>
                {mode === 'live' && (
                  <td className="py-1">
                    <button
                      onClick={() => removePressor(i)}
                      className="text-red-400 hover:text-red-300 text-xs px-1"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mode === 'live' && (
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={addPressor}
            disabled={pressors.length >= 4}
            className="text-xs bg-blue-700 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-2 py-1 rounded"
          >
            Add Pressor
          </button>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Log MAP:</label>
            <input
              type="number"
              placeholder="mmHg"
              className="bg-gray-800 text-gray-100 rounded px-2 py-0.5 text-xs w-20"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = parseInt((e.target as HTMLInputElement).value)
                  if (!isNaN(val)) {
                    addMapReading(val)
                    ;(e.target as HTMLInputElement).value = ''
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
