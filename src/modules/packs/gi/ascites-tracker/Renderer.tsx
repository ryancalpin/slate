import React from 'react'

const CITATION = 'EASL Clinical Practice Guidelines on the management of ascites. J Hepatol. 2010;52(5):691-694'

export function needsAlbumin(volumeL: number): boolean {
  return volumeL > 5
}

interface Paracentesis {
  date: string
  volumeL: number
  albuminGiven: boolean
}

interface AscitesData {
  paracenteses: Paracentesis[]
  fluidWbc: number
  sbpDiagnosed: boolean
  sbpTreatmentStarted: boolean
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const AscitesRenderer: React.FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as unknown as AscitesData
  const paracenteses = d.paracenteses ?? []

  const showWarning = paracenteses.some(p => needsAlbumin(p.volumeL) && !p.albuminGiven)

  const addRow = () => {
    const newRow: Paracentesis = { date: '', volumeL: 0, albuminGiven: false }
    onDataChange({ ...d, paracenteses: [...paracenteses, newRow] })
  }

  const updateRow = (idx: number, field: keyof Paracentesis, value: string | number | boolean) => {
    const updated = paracenteses.map((p, i) => i === idx ? { ...p, [field]: value } : p)
    onDataChange({ ...d, paracenteses: updated })
  }

  const removeRow = (idx: number) => {
    onDataChange({ ...d, paracenteses: paracenteses.filter((_, i) => i !== idx) })
  }

  return (
    <div className="p-3 space-y-4">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Ascites Tracker</h3>

      {showWarning ? (
        <div className="rounded-md bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-600 px-3 py-2">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            ⚠ Large-volume paracentesis: albumin 8g/L removed recommended per EASL guidelines
          </p>
        </div>
      ) : null}

      <div>
        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 uppercase tracking-wide">
          Paracentesis Log
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border border-gray-200 dark:border-gray-600 px-2 py-1 text-left">Date</th>
                <th className="border border-gray-200 dark:border-gray-600 px-2 py-1 text-left">Volume (L)</th>
                <th className="border border-gray-200 dark:border-gray-600 px-2 py-1 text-left">Albumin Given</th>
                <th className="border border-gray-200 dark:border-gray-600 px-2 py-1"></th>
              </tr>
            </thead>
            <tbody>
              {paracenteses.map((p, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-200 dark:border-gray-600 px-1 py-1">
                    <input
                      type="date"
                      value={p.date}
                      onChange={e => updateRow(idx, 'date', e.target.value)}
                      disabled={mode === 'build'}
                      className="w-full text-xs bg-transparent border-none outline-none"
                    />
                  </td>
                  <td className="border border-gray-200 dark:border-gray-600 px-1 py-1">
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={p.volumeL}
                      onChange={e => updateRow(idx, 'volumeL', parseFloat(e.target.value) || 0)}
                      disabled={mode === 'build'}
                      className="w-16 text-xs bg-transparent border-none outline-none"
                    />
                  </td>
                  <td className="border border-gray-200 dark:border-gray-600 px-2 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={p.albuminGiven}
                      onChange={e => updateRow(idx, 'albuminGiven', e.target.checked)}
                      disabled={mode === 'build'}
                      className="rounded"
                    />
                  </td>
                  <td className="border border-gray-200 dark:border-gray-600 px-1 py-1">
                    <button
                      onClick={() => removeRow(idx)}
                      disabled={mode === 'build'}
                      className="text-red-500 hover:text-red-700 text-xs px-1"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          onClick={addRow}
          disabled={mode === 'build'}
          className="mt-2 text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Add Paracentesis
        </button>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
          SBP Assessment
        </h4>
        <div className="space-y-2">
          <div>
            <label htmlFor="ascites-wbc" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
              Fluid WBC (cells/µL)
            </label>
            <input
              id="ascites-wbc"
              type="number"
              min={0}
              value={d.fluidWbc ?? 0}
              onChange={e => onDataChange({ ...d, fluidWbc: parseInt(e.target.value) || 0 })}
              disabled={mode === 'build'}
              className="w-32 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="ascites-sbp-dx"
              type="checkbox"
              checked={d.sbpDiagnosed ?? false}
              onChange={e => onDataChange({ ...d, sbpDiagnosed: e.target.checked })}
              disabled={mode === 'build'}
              className="rounded"
            />
            <label htmlFor="ascites-sbp-dx" className="text-xs text-gray-600 dark:text-gray-300">
              Diagnosed
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="ascites-sbp-tx"
              type="checkbox"
              checked={d.sbpTreatmentStarted ?? false}
              onChange={e => onDataChange({ ...d, sbpTreatmentStarted: e.target.checked })}
              disabled={mode === 'build'}
              className="rounded"
            />
            <label htmlFor="ascites-sbp-tx" className="text-xs text-gray-600 dark:text-gray-300">
              Treatment Started
            </label>
          </div>
        </div>
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
