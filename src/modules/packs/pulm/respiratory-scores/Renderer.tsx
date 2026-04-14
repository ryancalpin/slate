import type { FC } from 'react'
import {
  CITATION_CURB65,
  CITATION_BERLIN,
  calcCURB65,
  curb65Risk,
  berlinClassify,
} from './index'

interface RSData {
  curb65: boolean[]
  berlinOnset: boolean
  berlinRadio: boolean
  berlinNotCardiac: boolean
  pf: number
  peep: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const CURB65_LABELS = [
  'Confusion (new onset)',
  'BUN >19 mg/dL (>7 mmol/L)',
  'Respiratory Rate ≥30 br/min',
  'SBP <90 or DBP ≤60 mmHg',
  'Age ≥65 years',
]

const riskColor: Record<string, string> = {
  Low: 'text-green-700 dark:text-green-400',
  Moderate: 'text-amber-700 dark:text-amber-400',
  Severe: 'text-red-700 dark:text-red-400',
}

const berlinColor: Record<string, string> = {
  Mild: 'text-amber-600 dark:text-amber-400',
  Moderate: 'text-orange-700 dark:text-orange-400',
  Severe: 'text-red-700 dark:text-red-400',
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as Partial<RSData>
  const isLive = mode === 'live'
  const curb = (d.curb65 ?? [false, false, false, false, false]) as boolean[]

  const toggleCurb = (i: number) => {
    if (!isLive) return
    const next = [...curb]
    next[i] = !next[i]
    onDataChange({ ...data, curb65: next })
  }

  const score = calcCURB65(curb)
  const risk = curb65Risk(score)

  const allBerlinMet = !!(d.berlinOnset && d.berlinRadio && d.berlinNotCardiac)
  const berlinGrade =
    allBerlinMet && d.pf != null && d.peep != null
      ? berlinClassify(d.pf, d.peep)
      : null

  const setBoolean = (field: keyof RSData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLive) return
    onDataChange({ ...data, [field]: e.target.checked })
  }

  const setNumber = (field: keyof RSData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange({ ...data, [field]: Number(e.target.value) })
  }

  const inputCls = 'w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm'

  return (
    <div className="p-3 space-y-4">
      {/* CURB-65 */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2">CURB-65</h3>
        <div className="space-y-1">
          {CURB65_LABELS.map((label, i) => (
            <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600"
                checked={curb[i] ?? false}
                onChange={() => toggleCurb(i)}
                disabled={!isLive}
              />
              <span className="text-gray-700 dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>
        <div className="mt-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Score</span>
            <span className="font-mono font-bold text-lg">{score} / 5</span>
          </div>
          <p className={`font-semibold text-sm mt-1 ${riskColor[risk.label]}`}>{risk.label} risk</p>
          <p className="text-xs text-gray-500 mt-0.5">{risk.recommendation}</p>
        </div>
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_CURB65}</p>
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* Berlin ARDS */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200 mb-2">Berlin ARDS Criteria</h3>
        <div className="space-y-1 mb-2">
          {[
            ['berlinOnset', 'Onset within 1 week of insult or new/worsening respiratory symptoms'] as const,
            ['berlinRadio', 'Bilateral opacities on CXR/CT (not explained by effusions/collapse/nodules)'] as const,
            ['berlinNotCardiac', 'Respiratory failure not explained by cardiac failure/fluid overload'] as const,
          ].map(([field, label]) => (
            <label key={field} className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-gray-300 text-blue-600"
                checked={(d[field] as boolean | undefined) ?? false}
                onChange={setBoolean(field)}
                disabled={!isLive}
              />
              <span className="text-gray-700 dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-1">
          <label className="text-xs text-gray-500 w-36 shrink-0">P/F Ratio (mmHg)</label>
          <input type="number" className={inputCls} value={d.pf ?? ''} onChange={setNumber('pf')} readOnly={!isLive} />
        </div>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-xs text-gray-500 w-36 shrink-0">PEEP (cmH₂O)</label>
          <input type="number" className={inputCls} value={d.peep ?? ''} onChange={setNumber('peep')} readOnly={!isLive} />
        </div>

        <div className="rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2">
          {!allBerlinMet ? (
            <p className="text-sm text-gray-500">All 3 criteria must be met to classify ARDS severity.</p>
          ) : berlinGrade == null ? (
            <p className="text-sm text-gray-500">
              {d.peep != null && d.peep < 5
                ? 'PEEP <5 cmH₂O: Berlin classification requires PEEP ≥5'
                : 'P/F ratio >300: does not meet Berlin ARDS threshold'}
            </p>
          ) : (
            <p className={`font-bold text-base ${berlinColor[berlinGrade]}`}>Berlin ARDS: {berlinGrade}</p>
          )}
        </div>
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_BERLIN}</p>
      </div>
    </div>
  )
}
