import type { FC } from 'react'

const CITATION = 'KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2(1):1-138'

interface AKIData {
  baseCr: number
  currCr: number
  weightKg: number
  uoMl: number
  timeHr: number
  rrtInitiated: boolean
  acuteRise48h: boolean
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

/**
 * Calculate KDIGO AKI stage.
 * @param baseCr      Baseline creatinine (mg/dL)
 * @param currCr      Current creatinine (mg/dL)
 * @param uoMlKgHr    Urine output rate (mL/kg/h)
 * @param rrtInitiated Whether RRT has been initiated
 * @returns Stage 0-3
 */
export function calcAKIStage(
  baseCr: number,
  currCr: number,
  uoMlKgHr: number,
  rrtInitiated: boolean,
): 0 | 1 | 2 | 3 {
  const ratio = baseCr > 0 ? currCr / baseCr : 0

  // Stage 3 criteria (highest priority)
  if (rrtInitiated || ratio >= 3.0 || currCr >= 4.0 || uoMlKgHr < 0.3) return 3

  // Stage 2 criteria
  if (ratio >= 2.0) return 2

  // Stage 1 criteria
  if (ratio >= 1.5 || uoMlKgHr < 0.5) return 1

  return 0
}

const STAGE_COLORS: Record<number, string> = {
  0: 'bg-green-100 text-green-800 border-green-300',
  1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  2: 'bg-orange-100 text-orange-800 border-orange-300',
  3: 'bg-red-100 text-red-800 border-red-300',
}

function getCriteriaText(d: AKIData, uoRate: number, stage: number): string[] {
  const criteria: string[] = []
  if (d.rrtInitiated) criteria.push('RRT initiated')
  if (d.baseCr > 0 && d.currCr / d.baseCr >= 3.0) criteria.push(`Cr ×${(d.currCr / d.baseCr).toFixed(1)} from baseline (≥3.0)`)
  else if (d.baseCr > 0 && d.currCr / d.baseCr >= 2.0) criteria.push(`Cr ×${(d.currCr / d.baseCr).toFixed(1)} from baseline (≥2.0)`)
  else if (d.baseCr > 0 && d.currCr / d.baseCr >= 1.5) criteria.push(`Cr ×${(d.currCr / d.baseCr).toFixed(1)} from baseline (≥1.5)`)
  if (d.currCr >= 4.0) criteria.push('Cr ≥ 4.0 mg/dL (absolute)')
  if (d.acuteRise48h) criteria.push('Acute Cr rise ≥0.3 mg/dL in 48h')
  if (uoRate < 0.3) criteria.push(`UO ${uoRate.toFixed(2)} mL/kg/h (<0.3)`)
  else if (uoRate < 0.5) criteria.push(`UO ${uoRate.toFixed(2)} mL/kg/h (<0.5)`)
  if (stage === 0) criteria.push('No AKI criteria met')
  return criteria
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as unknown as AKIData
  const disabled = mode === 'build'

  const uoRate = d.weightKg > 0 && d.timeHr > 0 ? d.uoMl / d.weightKg / d.timeHr : 0
  const stage = calcAKIStage(d.baseCr, d.currCr, uoRate, d.rrtInitiated)
  const criteria = getCriteriaText(d, uoRate, stage)

  function update(patch: Partial<AKIData>) {
    onDataChange({ ...d, ...patch } as unknown as Record<string, unknown>)
  }

  return (
    <div className="p-3 space-y-3">
      {/* Inputs */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <label htmlFor="baseCr" className="block text-xs font-medium text-gray-600 dark:text-gray-300">Baseline Cr (mg/dL)</label>
          <input id="baseCr" type="number" step="0.1" value={d.baseCr || ''} disabled={disabled}
            onChange={e => update({ baseCr: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label htmlFor="currCr" className="block text-xs font-medium text-gray-600 dark:text-gray-300">Current Cr (mg/dL)</label>
          <input id="currCr" type="number" step="0.1" value={d.currCr || ''} disabled={disabled}
            onChange={e => update({ currCr: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label htmlFor="weightKg" className="block text-xs font-medium text-gray-600 dark:text-gray-300">Weight (kg)</label>
          <input id="weightKg" type="number" step="0.1" value={d.weightKg || ''} disabled={disabled}
            onChange={e => update({ weightKg: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label htmlFor="uoMl" className="block text-xs font-medium text-gray-600 dark:text-gray-300">Urine Output (mL)</label>
          <input id="uoMl" type="number" value={d.uoMl || ''} disabled={disabled}
            onChange={e => update({ uoMl: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800" />
        </div>
        <div>
          <label htmlFor="timeHr" className="block text-xs font-medium text-gray-600 dark:text-gray-300">Time Window (hr)</label>
          <input id="timeHr" type="number" value={d.timeHr || ''} disabled={disabled}
            onChange={e => update({ timeHr: parseFloat(e.target.value) || 0 })}
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800" />
        </div>
        <div className="flex flex-col justify-end gap-1">
          <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" checked={d.rrtInitiated} disabled={disabled}
              onChange={e => update({ rrtInitiated: e.target.checked })} />
            RRT Initiated
          </label>
          <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" checked={d.acuteRise48h} disabled={disabled}
              onChange={e => update({ acuteRise48h: e.target.checked })} />
            Acute rise ≥0.3 in 48h
          </label>
        </div>
      </div>

      {/* UO rate derived */}
      {d.weightKg > 0 && d.timeHr > 0 && (
        <p className="text-xs text-gray-500">
          UO rate: <span className="font-semibold">{uoRate.toFixed(2)} mL/kg/h</span>
        </p>
      )}

      {/* Stage badge */}
      <div className={`inline-flex items-center gap-2 border rounded px-3 py-2 font-bold text-lg ${STAGE_COLORS[stage]}`}>
        <span>Stage {stage}</span>
      </div>

      {/* Criteria met */}
      <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-0.5">
        {criteria.map((c, i) => <li key={i} className="flex items-start gap-1"><span>•</span>{c}</li>)}
      </ul>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
