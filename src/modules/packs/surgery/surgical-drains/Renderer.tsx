import type { FC } from 'react'
import { calcDailyDrainTotal, type SurgicalDrainsData, type Drain, type DrainEntry } from './index'

const CHARACTERS = ['serosanguinous', 'serous', 'bilious', 'hemorrhagic', 'purulent', 'chylous']
const SHIFTS: Array<'day' | 'evening' | 'night'> = ['day', 'evening', 'night']

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function last3Days(): string[] {
  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (2 - i))
    return d.toISOString().slice(0, 10)
  })
}

function Sparkline({ entries }: { entries: Array<{ date: string; volumeMl: number }> }) {
  const days = last3Days()
  const totals = days.map(d => calcDailyDrainTotal(entries, d))
  const max = Math.max(...totals, 1)
  return (
    <div className="flex items-end gap-1 h-8 mt-1">
      {totals.map((val, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5 w-5">
          <div
            className="w-4 bg-blue-400 rounded-sm"
            style={{ height: `${Math.round((val / max) * 28)}px` }}
            title={`${days[i]}: ${val} mL`}
          />
        </div>
      ))}
    </div>
  )
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ config, data, onDataChange, mode: _mode }) => {
  const threshold = (config.alertThresholdMl as number) ?? 500
  const typedData = data as SurgicalDrainsData
  const drains: Drain[] = typedData.drains ?? []

  function updateDrains(next: Drain[]) {
    onDataChange({ ...typedData, drains: next })
  }

  function addDrain() {
    if (drains.length >= 4) return
    updateDrains([...drains, { name: `Drain ${drains.length + 1}`, character: 'serosanguinous', entries: [] }])
  }

  function removeDrain(idx: number) {
    updateDrains(drains.filter((_, i) => i !== idx))
  }

  function updateDrain(idx: number, patch: Partial<Drain>) {
    updateDrains(drains.map((d, i) => i === idx ? { ...d, ...patch } : d))
  }

  function addEntry(drainIdx: number) {
    const entry: DrainEntry = { date: today(), shift: 'day', volumeMl: 0 }
    const drain = drains[drainIdx]
    updateDrain(drainIdx, { entries: [...drain.entries, entry] })
  }

  function updateEntry(drainIdx: number, entryIdx: number, patch: Partial<DrainEntry>) {
    const drain = drains[drainIdx]
    const entries = drain.entries.map((e, i) => i === entryIdx ? { ...e, ...patch } : e)
    updateDrain(drainIdx, { entries })
  }

  function removeEntry(drainIdx: number, entryIdx: number) {
    const drain = drains[drainIdx]
    updateDrain(drainIdx, { entries: drain.entries.filter((_, i) => i !== entryIdx) })
  }

  return (
    <div className="p-3 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Surgical Drains</h3>
        {drains.length < 4 && (
          <button
            onClick={addDrain}
            className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Add Drain
          </button>
        )}
      </div>

      {drains.map((drain, di) => {
        const dailyTotal = calcDailyDrainTotal(drain.entries, today())
        return (
          <div key={di} className="border border-gray-200 dark:border-gray-600 rounded p-2 space-y-2">
            <div className="flex items-center gap-2">
              <span className="sr-only">{drain.name}</span>
              <input
                className="flex-1 text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                value={drain.name}
                onChange={e => updateDrain(di, { name: e.target.value })}
                placeholder="Drain name"
              />
              <select
                className="text-sm border border-gray-300 dark:border-gray-500 rounded px-1 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                value={drain.character}
                onChange={e => updateDrain(di, { character: e.target.value })}
              >
                {CHARACTERS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button
                onClick={() => removeDrain(di)}
                className="text-xs text-red-500 hover:text-red-700 px-1"
                title="Remove drain"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Today's total: <span className="font-semibold text-gray-700 dark:text-gray-200">{dailyTotal} mL</span>
              <Sparkline entries={drain.entries} />
            </div>

            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400">
                  <th className="pb-1 pr-2">Date</th>
                  <th className="pb-1 pr-2">Shift</th>
                  <th className="pb-1 pr-2">Volume (mL)</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {drain.entries.map((entry, ei) => {
                  const alert = entry.volumeMl > threshold
                  return (
                    <tr
                      key={ei}
                      className={alert ? 'bg-amber-100 border border-amber-400 rounded' : ''}
                    >
                      <td className="pr-2 py-0.5">
                        <input
                          type="date"
                          className="text-xs border border-gray-300 dark:border-gray-500 rounded px-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                          value={entry.date}
                          onChange={e => updateEntry(di, ei, { date: e.target.value })}
                        />
                      </td>
                      <td className="pr-2 py-0.5">
                        <select
                          className="text-xs border border-gray-300 dark:border-gray-500 rounded px-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                          value={entry.shift}
                          onChange={e => updateEntry(di, ei, { shift: e.target.value as DrainEntry['shift'] })}
                        >
                          {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="pr-2 py-0.5">
                        <input
                          type="number"
                          min={0}
                          className="w-16 text-xs border border-gray-300 dark:border-gray-500 rounded px-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                          value={entry.volumeMl}
                          onChange={e => updateEntry(di, ei, { volumeMl: Number(e.target.value) })}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => removeEntry(di, ei)}
                          className="text-red-400 hover:text-red-600 text-xs"
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
              onClick={() => addEntry(di)}
              className="text-xs text-blue-600 hover:underline"
            >
              + Add entry
            </button>
          </div>
        )
      })}

      {drains.length === 0 && (
        <p className="text-xs text-gray-400 italic">No drains added. Use the button above to begin.</p>
      )}
    </div>
  )
}
