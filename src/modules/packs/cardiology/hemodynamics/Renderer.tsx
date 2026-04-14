import type { FC } from 'react'
import { HEMO_PARAMS } from './index'

type HemoData = Record<string, number>
const DEFAULT_DATA: HemoData = { ci: 0, pcwp: 0, svr: 0, map: 0, cvp: 0, paSys: 0, paDias: 0, paMean: 0 }

function valueColor(value: number, low: number, high: number): string {
  if (value === 0) return ''
  if (value < low || value > high) {
    const pctOff = Math.abs(value > high ? (value - high) / high : (low - value) / low)
    return pctOff > 0.2 ? 'text-red-400 font-bold' : 'text-amber-400 font-semibold'
  }
  return 'text-green-400'
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const title = (config.title as string) ?? 'Hemodynamics'
  const d: HemoData = { ...DEFAULT_DATA, ...(data as Record<string, number>) }
  const readOnly = mode === 'build'

  function update(key: string, value: number) {
    onDataChange({ ...d, [key]: value })
  }

  return (
    <div className="p-3 h-full flex flex-col gap-2 text-sm">
      <h3 className="font-semibold text-base">{title}</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="pb-1 pr-2">Parameter</th>
              <th className="pb-1 pr-2">Value</th>
              <th className="pb-1 pr-2">Unit</th>
              <th className="pb-1">Normal Range</th>
            </tr>
          </thead>
          <tbody>
            {HEMO_PARAMS.map(p => {
              const val = d[p.key] ?? 0
              const color = valueColor(val, p.low, p.high)
              return (
                <tr key={p.key} className="border-b border-gray-800">
                  <td className="py-1 pr-2 font-medium">{p.label}</td>
                  <td className={`py-1 pr-2 ${color}`}>
                    <input
                      type="number"
                      step="0.1"
                      className="bg-transparent border-b border-gray-600 w-16 focus:outline-none focus:border-blue-400"
                      value={val || ''}
                      readOnly={readOnly}
                      onChange={e => update(p.key, parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-1 pr-2 text-gray-400">{p.unit}</td>
                  <td className="py-1 text-gray-500">{p.rangeDisplay ?? `${p.low}–${p.high}`}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Renderer
