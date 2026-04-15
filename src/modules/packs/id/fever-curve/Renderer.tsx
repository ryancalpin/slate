interface TempEntry {
  timestamp: string
  tempC: number
}

interface FeverData {
  entries: TempEntry[]
  feverThresholdC: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const emptyEntry = (): TempEntry => ({
  timestamp: new Date().toISOString().slice(0, 16),
  tempC: 37.0,
})

function getBarHeight(tempC: number, min: number, max: number): number {
  if (max === min) return 50
  return Math.round(((tempC - min) / (max - min)) * 80) + 10
}

export function FeverRenderer({ data, onDataChange, mode }: Props) {
  const typed = data as unknown as FeverData
  const entries: TempEntry[] = typed.entries ?? []
  const threshold: number = typed.feverThresholdC ?? 38.0

  const temps = entries.map(e => e.tempC)
  const minTemp = temps.length ? Math.min(...temps) : 35
  const maxTemp = temps.length ? Math.max(...temps) : 42

  function update(index: number, field: keyof TempEntry, value: unknown) {
    const updated = entries.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    onDataChange({ entries: updated, feverThresholdC: threshold })
  }

  function addEntry() {
    onDataChange({ entries: [...entries, emptyEntry()], feverThresholdC: threshold })
  }

  function removeEntry(index: number) {
    onDataChange({
      entries: entries.filter((_, i) => i !== index),
      feverThresholdC: threshold,
    })
  }

  return (
    <div className="p-2 text-sm">
      <div className="flex items-center gap-4 mb-2">
        <span className="text-xs text-gray-500">Fever threshold:</span>
        <input
          type="number"
          step="0.1"
          className="w-16 border border-gray-300 rounded px-1 text-xs"
          value={threshold}
          onChange={e =>
            onDataChange({ entries, feverThresholdC: parseFloat(e.target.value) })
          }
        />
        <span className="text-xs text-gray-500">°C</span>
      </div>

      {/* Sparkline */}
      {entries.length > 0 && (
        <div className="flex items-end gap-1 h-16 mb-3 border-b border-gray-200 pb-1">
          {entries.map((e, i) => {
            const isFever = e.tempC >= threshold
            const height = getBarHeight(e.tempC, minTemp, maxTemp)
            return (
              <div
                key={i}
                data-testid="sparkline-bar"
                className={`w-3 rounded-t ${isFever ? 'bg-red-500' : 'bg-blue-400'}`}
                style={{ height: `${height}%` }}
                title={`${e.tempC}°C at ${e.timestamp}`}
              />
            )
          })}
        </div>
      )}

      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800 text-left">
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">Timestamp</th>
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">Temp (°C)</th>
            <th className="px-2 py-1 border border-gray-300 dark:border-gray-600">Trend</th>
            {mode === 'live' && (
              <th className="px-2 py-1 border border-gray-300 dark:border-gray-600"></th>
            )}
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => {
            const isFever = e.tempC >= threshold
            return (
              <tr
                key={i}
                className={`even:bg-gray-50 dark:even:bg-gray-900 ${isFever ? 'text-red-600 font-medium' : ''}`}
              >
                <td className="px-2 py-1 border border-gray-300 dark:border-gray-600">
                  <input
                    type="datetime-local"
                    className="bg-transparent outline-none text-xs"
                    value={e.timestamp}
                    onChange={ev => update(i, 'timestamp', ev.target.value)}
                  />
                </td>
                <td className="px-2 py-1 border border-gray-300 dark:border-gray-600">
                  <span className="mr-1">{e.tempC}</span>
                  <input
                    type="number"
                    step="0.1"
                    className="w-16 bg-transparent outline-none sr-only"
                    value={e.tempC}
                    aria-label="Temperature"
                    onChange={ev => update(i, 'tempC', parseFloat(ev.target.value))}
                  />
                </td>
                <td className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-center">
                  {isFever && (
                    <span className="text-xs font-bold text-red-600">FEVER</span>
                  )}
                </td>
                {mode === 'live' && (
                  <td className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-center">
                    <button
                      className="text-red-500 hover:text-red-700 text-xs"
                      onClick={() => removeEntry(i)}
                      aria-label="Remove entry"
                    >
                      ✕
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      {mode === 'live' && (
        <button
          className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={addEntry}
        >
          + Add Entry
        </button>
      )}
    </div>
  )
}
