import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

const VITALS = [
  { key: 'showHr', label: 'Heart Rate (HR)', rangeKey: 'hr' },
  { key: 'showBp', label: 'Blood Pressure (BP)', rangeKey: 'sbp' },
  { key: 'showRr', label: 'Respiratory Rate (RR)', rangeKey: 'rr' },
  { key: 'showTemp', label: 'Temperature', rangeKey: 'temp' },
  { key: 'showSpo2', label: 'SpO2', rangeKey: 'spo2' },
  { key: 'showWeight', label: 'Weight', rangeKey: null },
]

export const Editor: FC<Props> = ({ config, onConfigChange }) => {
  const ranges = (config.normalRanges as Record<string, { min?: number; max?: number }>) ?? {}

  const toggle = (key: string) =>
    onConfigChange({ ...config, [key]: !(config[key] !== false) })

  const updateRange = (vitalKey: string, bound: 'min' | 'max', val: string) => {
    const next = { ...ranges, [vitalKey]: { ...(ranges[vitalKey] ?? {}), [bound]: val === '' ? undefined : Number(val) } }
    onConfigChange({ ...config, normalRanges: next })
  }

  return (
    <div className="space-y-4 p-3">
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={config.showTrends !== false} onChange={() => toggle('showTrends')} className="rounded" />
          Show Trends
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          Temp:
          <select
            value={(config.tempUnit as string) ?? 'F'}
            onChange={e => onConfigChange({ ...config, tempUnit: e.target.value })}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-1 bg-transparent"
          >
            <option value="F">°F</option>
            <option value="C">°C</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          Weight:
          <select
            value={(config.weightUnit as string) ?? 'kg'}
            onChange={e => onConfigChange({ ...config, weightUnit: e.target.value })}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-1 bg-transparent"
          >
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
        </label>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-500 text-left">
            <th className="pb-1 pr-3">Vital</th>
            <th className="pb-1 pr-2">Show</th>
            <th className="pb-1 pr-2">Min</th>
            <th className="pb-1">Max</th>
          </tr>
        </thead>
        <tbody className="space-y-1">
          {VITALS.map(v => (
            <tr key={v.key}>
              <td className="pr-3 py-0.5">{v.label}</td>
              <td className="pr-2">
                <input
                  type="checkbox"
                  checked={config[v.key] !== false}
                  onChange={() => toggle(v.key)}
                  className="rounded"
                />
              </td>
              {v.rangeKey ? (
                <>
                  <td className="pr-2">
                    <input
                      type="number"
                      value={ranges[v.rangeKey]?.min ?? ''}
                      onChange={e => updateRange(v.rangeKey!, 'min', e.target.value)}
                      className="w-16 border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-transparent text-sm"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={ranges[v.rangeKey]?.max ?? ''}
                      onChange={e => updateRange(v.rangeKey!, 'max', e.target.value)}
                      className="w-16 border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-transparent text-sm"
                    />
                  </td>
                </>
              ) : (
                <td colSpan={2} className="text-gray-400 text-xs">no range</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
