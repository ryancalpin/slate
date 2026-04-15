import { useState } from 'react'

interface ScheduleRow {
  date: string
  dose: number
  unit: string
}

interface TaperData {
  drug: string
  schedule: ScheduleRow[]
  prolongedHighDose: boolean
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const ADVISORY_NOTE =
  'Prolonged high-dose corticosteroid therapy may suppress the HPA axis. Consider adrenal insufficiency in the event of physiologic stress. Taper slowly and reassess.'

export function SteroidTaperRenderer({ data, onDataChange, mode }: Props) {
  const d = data as unknown as TaperData
  const schedule = d.schedule ?? []
  const prolongedHighDose = d.prolongedHighDose ?? false
  const disabled = mode === 'build'

  const todayStr = new Date().toISOString().slice(0, 10)

  const [newDate, setNewDate] = useState('')
  const [newDose, setNewDose] = useState('')
  const [newUnit, setNewUnit] = useState('mg')

  function addRow() {
    if (!newDose) return
    const row: ScheduleRow = {
      date: newDate || todayStr,
      dose: Number(newDose),
      unit: newUnit,
    }
    onDataChange({ ...d, schedule: [...schedule, row] })
    setNewDate('')
    setNewDose('')
    setNewUnit('mg')
  }

  function removeRow(idx: number) {
    onDataChange({ ...d, schedule: schedule.filter((_, i) => i !== idx) })
  }

  return (
    <div className="p-3 space-y-3 text-sm">
      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-700 dark:text-gray-300 w-16">Drug</label>
        <input
          className="border rounded px-2 py-1 flex-1 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          value={d.drug ?? ''}
          disabled={disabled}
          onChange={(e) => onDataChange({ ...d, drug: e.target.value })}
          placeholder="e.g. Prednisone"
        />
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="border dark:border-gray-600 px-2 py-1 text-left">Date</th>
            <th className="border dark:border-gray-600 px-2 py-1 text-right">Dose</th>
            <th className="border dark:border-gray-600 px-2 py-1 text-left">Unit</th>
            {!disabled && <th className="border dark:border-gray-600 px-2 py-1"></th>}
          </tr>
        </thead>
        <tbody>
          {schedule.map((row, idx) => {
            const isToday = row.date === todayStr
            return (
              <tr
                key={idx}
                className={
                  isToday
                    ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-inset ring-blue-400 today-highlight'
                    : ''
                }
              >
                <td className="border dark:border-gray-600 px-2 py-1 text-gray-700 dark:text-gray-300 font-medium">
                  {row.date}
                  {isToday && (
                    <span className="ml-1 text-xs bg-blue-500 text-white px-1 rounded">Today</span>
                  )}
                </td>
                <td className="border dark:border-gray-600 px-2 py-1 text-right font-mono text-gray-900 dark:text-gray-100 font-bold">
                  {row.dose}
                </td>
                <td className="border dark:border-gray-600 px-2 py-1 text-gray-700 dark:text-gray-300">{row.unit}</td>
                {!disabled && (
                  <td className="border dark:border-gray-600 px-2 py-1 text-center">
                    <button onClick={() => removeRow(idx)} className="text-red-500 hover:text-red-700 text-xs">×</button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>

      {!disabled && (
        <div className="flex gap-2 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Date</label>
            <input
              type="date"
              className="border rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Dose</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-20 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              value={newDose}
              onChange={(e) => setNewDose(e.target.value)}
              placeholder="0"
              min={0}
              step={0.5}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">Unit</label>
            <select
              className="border rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
            >
              <option value="mg">mg</option>
              <option value="mcg">mcg</option>
              <option value="mg/kg">mg/kg</option>
            </select>
          </div>
          <button
            onClick={addRow}
            className="bg-blue-600 text-white rounded px-3 py-1 text-xs hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="prolonged-high-dose"
          checked={prolongedHighDose}
          disabled={disabled}
          onChange={(e) => onDataChange({ ...d, prolongedHighDose: e.target.checked })}
          className="rounded"
        />
        <label htmlFor="prolonged-high-dose" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
          Prolonged high-dose course (≥21 days AND dose ≥ prednisone 20 mg/day equivalent)
        </label>
      </div>

      {prolongedHighDose && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-600 rounded p-2 text-xs text-amber-800 dark:text-amber-300">
          <span className="font-semibold">Advisory:</span> {ADVISORY_NOTE}
        </div>
      )}
    </div>
  )
}

export default SteroidTaperRenderer
