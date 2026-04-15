import type { FC } from 'react'
import type { OstomyTrackerData, OstomyEntry } from './index'

const STOMA_TYPES = ['colostomy', 'ileostomy', 'urostomy', 'jejunostomy']
const SHIFTS = ['day', 'evening', 'night']
const CHARACTERS = ['liquid', 'pasty', 'formed', 'urine', 'bilious']
const SKIN_STATUSES = ['intact', 'moist', 'irritated', 'breakdown']

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

function dailyTotal(entries: OstomyEntry[], date: string): number {
  return entries.filter(e => e.date === date).reduce((sum, e) => sum + e.volumeMl, 0)
}

function Sparkline({ entries }: { entries: OstomyEntry[] }) {
  const days = last3Days()
  const totals = days.map(d => dailyTotal(entries, d))
  const max = Math.max(...totals, 1)
  return (
    <div className="flex items-end gap-1 h-8 mt-1">
      {totals.map((val, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5 w-5">
          <div
            className="w-4 bg-purple-400 rounded-sm"
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

export const Renderer: FC<Props> = ({ data, onDataChange }) => {
  const d = data as OstomyTrackerData
  const entries: OstomyEntry[] = d.entries ?? []
  const total = dailyTotal(entries, today())

  function update(patch: Partial<OstomyTrackerData>) {
    onDataChange({ ...d, ...patch })
  }

  function addEntry() {
    const entry: OstomyEntry = { date: today(), shift: 'day', volumeMl: 0, character: 'liquid' }
    update({ entries: [...entries, entry] })
  }

  function updateEntry(idx: number, patch: Partial<OstomyEntry>) {
    update({ entries: entries.map((e, i) => i === idx ? { ...e, ...patch } : e) })
  }

  function removeEntry(idx: number) {
    update({ entries: entries.filter((_, i) => i !== idx) })
  }

  return (
    <div className="p-3 space-y-3">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Ostomy Tracker</h3>

      <div className="flex gap-3 flex-wrap">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Stoma Type</label>
          <select
            className="text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
            value={d.stomaType ?? 'ileostomy'}
            onChange={e => update({ stomaType: e.target.value })}
          >
            {STOMA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Peristomal Skin</label>
          <select
            className="text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
            value={d.skinStatus ?? 'intact'}
            onChange={e => update({ skinStatus: e.target.value })}
          >
            {SKIN_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Last Appliance Change</label>
          <input
            type="date"
            className="text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
            value={d.lastApplianceChange ?? ''}
            onChange={e => update({ lastApplianceChange: e.target.value })}
          />
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Today's total output: <span className="font-semibold text-gray-700 dark:text-gray-200">{total} mL</span>
        <Sparkline entries={entries} />
      </div>

      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="text-left text-gray-500 dark:text-gray-400">
            <th className="pb-1 pr-2">Date</th>
            <th className="pb-1 pr-2">Shift</th>
            <th className="pb-1 pr-2">Volume (mL)</th>
            <th className="pb-1 pr-2">Character</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={i}>
              <td className="pr-2 py-0.5">
                <input
                  type="date"
                  className="text-xs border border-gray-300 dark:border-gray-500 rounded px-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                  value={entry.date}
                  onChange={e => updateEntry(i, { date: e.target.value })}
                />
              </td>
              <td className="pr-2 py-0.5">
                <select
                  className="text-xs border border-gray-300 dark:border-gray-500 rounded px-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                  value={entry.shift}
                  onChange={e => updateEntry(i, { shift: e.target.value })}
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
                  onChange={e => updateEntry(i, { volumeMl: Number(e.target.value) })}
                />
              </td>
              <td className="pr-2 py-0.5">
                <select
                  className="text-xs border border-gray-300 dark:border-gray-500 rounded px-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                  value={entry.character}
                  onChange={e => updateEntry(i, { character: e.target.value })}
                >
                  {CHARACTERS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </td>
              <td>
                <button
                  onClick={() => removeEntry(i)}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={addEntry}
        className="text-xs text-blue-600 hover:underline"
      >
        + Add Entry
      </button>
    </div>
  )
}
