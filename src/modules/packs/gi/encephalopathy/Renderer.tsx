import React from 'react'

const CITATION = 'Conn HO et al. Dig Dis Sci. 1977;22(2):103-108'

const WEST_HAVEN_GRADES = [
  {
    grade: 0,
    label: 'Grade 0',
    criteria: 'Normal — no detectable changes in personality or behavior.',
  },
  {
    grade: 1,
    label: 'Grade I',
    criteria:
      'Trivial lack of awareness, euphoria or anxiety, shortened attention span, impaired addition or subtraction.',
  },
  {
    grade: 2,
    label: 'Grade II',
    criteria:
      'Lethargy or apathy, minimal disorientation to time or place, subtle personality change, inappropriate behavior.',
  },
  {
    grade: 3,
    label: 'Grade III',
    criteria: 'Somnolent but arousable, gross disorientation, bizarre behavior.',
  },
  {
    grade: 4,
    label: 'Grade IV',
    criteria: 'Coma — no response to painful stimuli.',
  },
]

interface LactuloseDose {
  datetime: string
  bm: boolean
  dose: string
}

interface EncephalopathyData {
  westHavenGrade: number
  laxuloseLog: LactuloseDose[]
  rifaximin: boolean
  rifaximinDose: string
  stoolsPerDay: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const EncephalopathyRenderer: React.FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as unknown as EncephalopathyData
  const log = d.laxuloseLog ?? []
  const selectedGrade = WEST_HAVEN_GRADES.find(g => g.grade === (d.westHavenGrade ?? 0)) ?? WEST_HAVEN_GRADES[0]

  const addLogEntry = () => {
    const entry: LactuloseDose = { datetime: new Date().toISOString().slice(0, 16), bm: false, dose: '' }
    onDataChange({ ...d, laxuloseLog: [...log, entry] })
  }

  const updateLogEntry = (idx: number, field: keyof LactuloseDose, value: string | boolean) => {
    const updated = log.map((entry, i) => i === idx ? { ...entry, [field]: value } : entry)
    onDataChange({ ...d, laxuloseLog: updated })
  }

  const removeLogEntry = (idx: number) => {
    onDataChange({ ...d, laxuloseLog: log.filter((_, i) => i !== idx) })
  }

  const gradeColor = ['text-green-600', 'text-yellow-600', 'text-orange-500', 'text-red-500', 'text-red-800'][d.westHavenGrade ?? 0]

  return (
    <div className="p-3 space-y-4">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Hepatic Encephalopathy</h3>

      <div>
        <label htmlFor="wh-grade" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
          West Haven Grade
        </label>
        <select
          id="wh-grade"
          value={d.westHavenGrade ?? 0}
          onChange={e => onDataChange({ ...d, westHavenGrade: parseInt(e.target.value) })}
          disabled={mode === 'build'}
          className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
        >
          <option value={0}>Grade 0</option>
          <option value={1}>Grade I</option>
          <option value={2}>Grade II</option>
          <option value={3}>Grade III</option>
          <option value={4}>Grade IV</option>
        </select>

        <div className="mt-2 rounded-md p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <p className={`text-xs font-semibold mb-0.5 ${gradeColor}`}>Criteria</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">{selectedGrade.criteria}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
          Lactulose Log
        </h4>
        {log.length > 0 ? (
          <div className="space-y-1 mb-2">
            {log.map((entry, idx) => (
              <div key={idx} className="flex gap-2 items-center text-xs">
                <input
                  type="datetime-local"
                  value={entry.datetime}
                  onChange={e => updateLogEntry(idx, 'datetime', e.target.value)}
                  disabled={mode === 'build'}
                  className="text-xs border border-gray-300 dark:border-gray-600 rounded px-1 bg-white dark:bg-gray-800"
                />
                <input
                  type="text"
                  placeholder="Dose (e.g. 30mL TID)"
                  value={entry.dose}
                  onChange={e => updateLogEntry(idx, 'dose', e.target.value)}
                  disabled={mode === 'build'}
                  className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded px-1 bg-white dark:bg-gray-800"
                />
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={entry.bm}
                    onChange={e => updateLogEntry(idx, 'bm', e.target.checked)}
                    disabled={mode === 'build'}
                    className="rounded"
                  />
                  <span>BM</span>
                </label>
                <button
                  onClick={() => removeLogEntry(idx)}
                  disabled={mode === 'build'}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <button
          onClick={addLogEntry}
          disabled={mode === 'build'}
          className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Add Entry
        </button>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
        <div className="flex items-center gap-2">
          <input
            id="rifaximin-toggle"
            type="checkbox"
            checked={d.rifaximin ?? false}
            onChange={e => onDataChange({ ...d, rifaximin: e.target.checked })}
            disabled={mode === 'build'}
            className="rounded"
          />
          <label htmlFor="rifaximin-toggle" className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Rifaximin on board
          </label>
        </div>
        {d.rifaximin ? (
          <div>
            <label htmlFor="rifaximin-dose" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
              Rifaximin dose
            </label>
            <input
              id="rifaximin-dose"
              type="text"
              placeholder="e.g. 550mg BID"
              value={d.rifaximinDose ?? ''}
              onChange={e => onDataChange({ ...d, rifaximinDose: e.target.value })}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
            />
          </div>
        ) : null}

        <div>
          <label htmlFor="stools-per-day" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
            Stools per day
          </label>
          <input
            id="stools-per-day"
            type="number"
            min={0}
            max={30}
            value={d.stoolsPerDay ?? 0}
            onChange={e => onDataChange({ ...d, stoolsPerDay: parseInt(e.target.value) || 0 })}
            disabled={mode === 'build'}
            className="w-24 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
          />
        </div>
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
