import React from 'react'

const CITATION = 'Kim WR et al. Hepatology. 2008;48(4):1362-1370'

export function calcMELD(cr: number, bili: number, inr: number): number {
  const crCapped = Math.min(Math.max(cr, 1.0), 4.0)
  const biliFloored = Math.max(bili, 1.0)
  const inrFloored = Math.max(inr, 1.0)
  const score =
    3.78 * Math.log(biliFloored) +
    11.2 * Math.log(inrFloored) +
    9.57 * Math.log(crCapped) +
    6.43
  return Math.round(score)
}

export function calcMELDNa(meld: number, na: number): number {
  const naClamped = Math.min(Math.max(na, 125), 137)
  const score = meld + 1.32 * (137 - naClamped) - 0.033 * meld * (137 - naClamped)
  return Math.round(score)
}

const MORTALITY_TABLE: Array<{ label: string; mortality: string }> = [
  { label: '≤ 9', mortality: '1.9%' },
  { label: '10–19', mortality: '6%' },
  { label: '20–29', mortality: '19.6%' },
  { label: '30–39', mortality: '52.6%' },
  { label: '≥ 40', mortality: '71.3%' },
]

interface MeldNaData {
  creatinine: number
  bilirubin: number
  inr: number
  sodium: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const MeldNaRenderer: React.FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as unknown as MeldNaData
  const meld = calcMELD(d.creatinine ?? 1, d.bilirubin ?? 1, d.inr ?? 1)
  const meldNa = calcMELDNa(meld, d.sodium ?? 137)

  const getMortalityRow = (score: number) => {
    if (score <= 9) return MORTALITY_TABLE[0]
    if (score <= 19) return MORTALITY_TABLE[1]
    if (score <= 29) return MORTALITY_TABLE[2]
    if (score <= 39) return MORTALITY_TABLE[3]
    return MORTALITY_TABLE[4]
  }

  const highlighted = getMortalityRow(meldNa)

  const update = (field: keyof MeldNaData, value: number) => {
    onDataChange({ ...d, [field]: value })
  }

  return (
    <div className="p-3 space-y-4">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">MELD / Sodium-Adjusted Score</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="meld-cr" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Creatinine (mg/dL)
          </label>
          <input
            id="meld-cr"
            type="number"
            min={0}
            max={20}
            step={0.1}
            value={d.creatinine ?? 1}
            onChange={e => update('creatinine', parseFloat(e.target.value) || 1)}
            disabled={mode === 'build'}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
          />
          <p className="text-xs text-gray-400 mt-0.5">Capped at 4.0 (UNOS)</p>
        </div>

        <div>
          <label htmlFor="meld-bili" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Bilirubin (mg/dL)
          </label>
          <input
            id="meld-bili"
            type="number"
            min={0}
            step={0.1}
            value={d.bilirubin ?? 1}
            onChange={e => update('bilirubin', parseFloat(e.target.value) || 1)}
            disabled={mode === 'build'}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
          />
          <p className="text-xs text-gray-400 mt-0.5">Min 1.0</p>
        </div>

        <div>
          <label htmlFor="meld-inr" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            INR
          </label>
          <input
            id="meld-inr"
            type="number"
            min={0}
            step={0.1}
            value={d.inr ?? 1}
            onChange={e => update('inr', parseFloat(e.target.value) || 1)}
            disabled={mode === 'build'}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
          />
          <p className="text-xs text-gray-400 mt-0.5">Min 1.0</p>
        </div>

        <div>
          <label htmlFor="meld-na" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
            Sodium (mEq/L)
          </label>
          <input
            id="meld-na"
            type="number"
            min={100}
            max={160}
            step={1}
            value={d.sodium ?? 137}
            onChange={e => update('sodium', parseInt(e.target.value) || 137)}
            disabled={mode === 'build'}
            className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-2 py-1"
          />
          <p className="text-xs text-gray-400 mt-0.5">Clamped 125–137</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 p-3 text-center">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wide">MELD Score</p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-200 mt-1">{meld}</p>
        </div>
        <div className="flex-1 rounded-lg bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 p-3 text-center">
          <p className="text-xs font-medium text-purple-600 dark:text-purple-300 uppercase tracking-wide">MELD-Na</p>
          <p className="text-3xl font-bold text-purple-700 dark:text-purple-200 mt-1">{meldNa}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">90-day mortality table</p>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border border-gray-200 dark:border-gray-600 px-2 py-1 text-left">Score Range</th>
              <th className="border border-gray-200 dark:border-gray-600 px-2 py-1 text-left">Mortality</th>
            </tr>
          </thead>
          <tbody>
            {MORTALITY_TABLE.map(row => (
              <tr
                key={row.label}
                className={row.label === highlighted.label ? 'bg-yellow-100 dark:bg-yellow-900/40 font-semibold' : ''}
              >
                <td className="border border-gray-200 dark:border-gray-600 px-2 py-1">{row.label}</td>
                <td className="border border-gray-200 dark:border-gray-600 px-2 py-1">{row.mortality}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
