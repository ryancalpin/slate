import { FC } from 'react'

const CITATION_FENA = 'Miller TR et al. Ann Intern Med. 1978;89(1):47-50'
const CITATION_FEUREA = 'Carvounis CP et al. Am J Kidney Dis. 2002;39(3):455-462'

interface UrineData {
  naU: number; crU: number; naS: number; crS: number
  ureaNu: number; ureaS: number; uOsm: number; proteinU: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

/**
 * FENa = (Na_u × Cr_s) / (Na_s × Cr_u) × 100
 * Returns 0 if denominator is 0.
 */
export function calcFENa(naU: number, crS: number, naS: number, crU: number): number {
  const denom = naS * crU
  if (denom === 0) return 0
  return (naU * crS) / denom * 100
}

/**
 * FEUrea = (Urea_u × Cr_s) / (Urea_s × Cr_u) × 100
 * Returns 0 if denominator is 0.
 */
export function calcFEUrea(ureaNu: number, crS: number, ureaS: number, crU: number): number {
  const denom = ureaS * crU
  if (denom === 0) return 0
  return (ureaNu * crS) / denom * 100
}

function interpretFENa(fena: number): string {
  if (fena < 1) return 'Prerenal (< 1%)'
  if (fena <= 2) return 'Indeterminate (1–2%)'
  return 'Intrinsic renal (> 2%)'
}

function interpretFEUrea(feurea: number): string {
  if (feurea < 35) return 'Prerenal — preferred on diuretics (< 35%)'
  if (feurea <= 50) return 'Indeterminate (35–50%)'
  return 'Intrinsic renal (> 50%)'
}

function interpretProtCr(ratio: number): string {
  if (ratio >= 3.5) return 'Nephrotic range (≥ 3.5)'
  if (ratio >= 0.2) return 'Abnormal (0.2–3.5)'
  return 'Normal (< 0.2)'
}

function numField(id: string, labelText: string, value: number, unit: string, onChange: (v: number) => void, disabled: boolean) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
        {labelText} {unit && <span className="text-gray-400">({unit})</span>}
      </label>
      <input
        id={id}
        type="number"
        step="0.1"
        value={value || ''}
        disabled={disabled}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800"
      />
    </div>
  )
}

function ResultCard({ label, value, interp, unit }: { label: string; value: number; interp: string; unit: string }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded p-2">
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{label}</p>
      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{value.toFixed(1)}<span className="text-xs font-normal text-gray-400 ml-1">{unit}</span></p>
      <p className="text-xs text-gray-500">{interp}</p>
    </div>
  )
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as unknown as UrineData
  const disabled = mode === 'build'

  function update(patch: Partial<UrineData>) {
    onDataChange({ ...d, ...patch } as unknown as Record<string, unknown>)
  }

  const fena = calcFENa(d.naU, d.crS, d.naS, d.crU)
  const feurea = calcFEUrea(d.ureaNu, d.crS, d.ureaS, d.crU)
  const protCrRatio = d.crU > 0 ? d.proteinU / d.crU : 0

  return (
    <div className="p-3 space-y-3">
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Inputs</p>

      {/* Urine values */}
      <div className="grid grid-cols-2 gap-2">
        {numField('naU', 'Urine Na', d.naU, 'mEq/L', v => update({ naU: v }), disabled)}
        {numField('crU', 'Urine Cr', d.crU, 'mg/dL', v => update({ crU: v }), disabled)}
        {numField('ureaNu', 'Urine Urea N', d.ureaNu, 'mg/dL', v => update({ ureaNu: v }), disabled)}
        {numField('uOsm', 'Urine Osmolality', d.uOsm, 'mOsm/kg', v => update({ uOsm: v }), disabled)}
        {numField('proteinU', 'Urine Protein', d.proteinU, 'mg/dL', v => update({ proteinU: v }), disabled)}
      </div>

      {/* Serum values */}
      <div className="grid grid-cols-2 gap-2">
        {numField('naS', 'Serum Na', d.naS, 'mEq/L', v => update({ naS: v }), disabled)}
        {numField('crS', 'Serum Cr', d.crS, 'mg/dL', v => update({ crS: v }), disabled)}
        {numField('ureaS', 'Serum Urea N (BUN)', d.ureaS, 'mg/dL', v => update({ ureaS: v }), disabled)}
      </div>

      {/* Results */}
      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Results</p>
      <div className="grid grid-cols-1 gap-2">
        <ResultCard label="FENa" value={fena} interp={interpretFENa(fena)} unit="%" />
        <p className="text-xs italic text-gray-400 -mt-1">{CITATION_FENA}</p>
        <ResultCard label="FEUrea" value={feurea} interp={interpretFEUrea(feurea)} unit="%" />
        <p className="text-xs italic text-gray-400 -mt-1">{CITATION_FEUREA}</p>
        <ResultCard label="Protein/Cr Ratio" value={protCrRatio} interp={interpretProtCr(protCrRatio)} unit="" />
      </div>
    </div>
  )
}
