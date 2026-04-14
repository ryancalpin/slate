import type { FC } from 'react'
import {
  CITATION_WINTERS,
  CITATION_AA,
  interpretABG,
  calcAaGradient,
  calcPFRatio,
  wintersExpectedPCO2,
  metAlkalosisExpectedPCO2,
} from './index'

interface ABGData {
  ph: number
  pco2: number
  pao2: number
  hco3: number
  spo2: number
  fio2: number
  patientAge: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as Partial<ABGData>
  const isLive = mode === 'live'

  const set = (field: keyof ABGData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange({ ...data, [field]: Number(e.target.value) })
  }

  const hasFullABG = d.ph != null && d.pco2 != null && d.hco3 != null
  const interpretation = hasFullABG ? interpretABG(d.ph!, d.pco2!, d.hco3!) : null

  // Compensation check
  let compensationNote: string | null = null
  if (interpretation && d.pco2 != null && d.hco3 != null) {
    if (interpretation.disorder === 'Acidosis' && interpretation.type === 'Metabolic') {
      const { low, high } = wintersExpectedPCO2(d.hco3)
      if (d.pco2 < low) compensationNote = `PaCO₂ ${d.pco2} < expected ${low.toFixed(1)}-${high.toFixed(1)}: additional respiratory alkalosis`
      else if (d.pco2 > high) compensationNote = `PaCO₂ ${d.pco2} > expected ${low.toFixed(1)}-${high.toFixed(1)}: additional respiratory acidosis`
      else compensationNote = `PaCO₂ appropriately compensated (Winter's: ${low.toFixed(1)}-${high.toFixed(1)})`
    } else if (interpretation.disorder === 'Alkalosis' && interpretation.type === 'Metabolic') {
      const { low, high } = metAlkalosisExpectedPCO2(d.hco3)
      if (d.pco2 < low) compensationNote = `PaCO₂ ${d.pco2} < expected ${low.toFixed(1)}-${high.toFixed(1)}: additional respiratory alkalosis`
      else if (d.pco2 > high) compensationNote = `PaCO₂ ${d.pco2} > expected ${low.toFixed(1)}-${high.toFixed(1)}: additional respiratory acidosis`
      else compensationNote = `PaCO₂ appropriately compensated (expected: ${low.toFixed(1)}-${high.toFixed(1)})`
    }
  }

  const aaGradient =
    d.fio2 != null && d.pco2 != null && d.pao2 != null
      ? calcAaGradient(d.fio2, d.pco2, d.pao2)
      : null

  const normalAa = d.patientAge != null ? d.patientAge / 4 + 4 : null

  const pfRatio =
    d.pao2 != null && d.fio2 != null && d.fio2 > 0
      ? calcPFRatio(d.pao2, d.fio2)
      : null

  const inputCls =
    'w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500'

  const disorderColor =
    interpretation == null
      ? ''
      : interpretation.disorder === 'Normal'
      ? 'text-green-700 dark:text-green-400'
      : 'text-red-700 dark:text-red-400'

  const fields: Array<[keyof ABGData, string, string]> = [
    ['ph', 'pH', '7.35–7.45'],
    ['pco2', 'PaCO₂ (mmHg)', '35–45'],
    ['pao2', 'PaO₂ (mmHg)', '80–100'],
    ['hco3', 'HCO₃ (mEq/L)', '22–26'],
    ['spo2', 'SpO₂ (%)', '≥95'],
    ['fio2', 'FiO₂ (%)', '21–100'],
    ['patientAge', 'Patient Age (yr)', ''],
  ]

  return (
    <div className="p-3 space-y-3">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">ABG Interpreter</h3>

      <div className="space-y-2">
        {fields.map(([field, label, hint]) => (
          <div key={field} className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-36 shrink-0">
              {label}
              {hint && <span className="ml-1 text-gray-400">({hint})</span>}
            </label>
            <input
              type="number"
              step="any"
              className={inputCls}
              value={(d[field] as number | undefined) ?? ''}
              onChange={set(field)}
              readOnly={!isLive}
            />
          </div>
        ))}
      </div>

      {/* Interpretation */}
      {interpretation && (
        <div className="rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Interpretation</p>
          <p className={`font-semibold text-sm ${disorderColor}`}>
            {interpretation.disorder === 'Normal'
              ? 'Normal acid-base'
              : `${interpretation.type} ${interpretation.disorder}`}
          </p>
          {compensationNote && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{compensationNote}</p>
          )}
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">A-a Gradient</span>
              <span className="font-mono">
                {aaGradient != null
                  ? `${aaGradient.toFixed(1)} mmHg${normalAa != null ? ` (normal ≤${normalAa.toFixed(0)})` : ''}`
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">P/F Ratio</span>
              <span className="font-mono">
                {pfRatio != null ? pfRatio.toFixed(0) : '—'}
              </span>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs italic text-gray-400 mt-1">{CITATION_WINTERS}</p>
      <p className="text-xs italic text-gray-400">{CITATION_AA}</p>
    </div>
  )
}
