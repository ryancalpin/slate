// src/modules/calculated/Renderer.tsx
import { useState, useCallback } from 'react'
import {
  calcAnionGap,
  calcMAP,
  calcBMI,
  calcAAGradient,
  calcCKDEPI,
  calcCorrectedCalcium,
} from './formulas'

interface CustomFormula {
  id: string
  name: string
  formula: string
  citation: string
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

type Inputs = Record<string, string>

function fmt(n: number | null): string {
  if (n === null || isNaN(n)) return '—'
  return n.toFixed(1)
}

function numVal(inputs: Inputs, key: string): number | null {
  const v = inputs[key]
  if (v === undefined || v === '') return null
  const n = Number(v)
  return isNaN(n) ? null : n
}

export function Renderer({ config, data, onDataChange, mode }: Props) {
  const enabledCalculators = (config.enabledCalculators as string[]) ?? ['anion-gap', 'map', 'bmi']
  const customFormulas = (config.customFormulas as CustomFormula[]) ?? []

  // Store calculator inputs in local component state (ephemeral, not persisted)
  const [inputs, setInputs] = useState<Inputs>({})

  const setInput = useCallback((key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }, [])

  const na = numVal(inputs, 'na')
  const cl = numVal(inputs, 'cl')
  const co2 = numVal(inputs, 'co2')
  const sbp = numVal(inputs, 'sbp')
  const dbp = numVal(inputs, 'dbp')
  const weight = numVal(inputs, 'weight')
  const height = numVal(inputs, 'height')
  const fio2 = numVal(inputs, 'fio2')
  const paco2 = numVal(inputs, 'paco2')
  const pao2 = numVal(inputs, 'pao2')
  const cr = numVal(inputs, 'cr')
  const age = numVal(inputs, 'age')
  const sex = inputs['sex'] as 'male' | 'female' | undefined
  const measuredCa = numVal(inputs, 'measuredCa')
  const albumin = numVal(inputs, 'albumin')

  const anionGap =
    na !== null && cl !== null && co2 !== null ? calcAnionGap(na, cl, co2) : null
  const map =
    sbp !== null && dbp !== null ? calcMAP(sbp, dbp) : null
  const bmi =
    weight !== null && height !== null && height > 0 ? calcBMI(weight, height) : null
  const aaGrad =
    fio2 !== null && paco2 !== null && pao2 !== null
      ? calcAAGradient(fio2, paco2, pao2)
      : null
  const gfr =
    cr !== null && age !== null && (sex === 'male' || sex === 'female')
      ? calcCKDEPI(cr, age, sex)
      : null
  const corrCa =
    measuredCa !== null && albumin !== null
      ? calcCorrectedCalcium(measuredCa, albumin)
      : null

  // Suppress unused data warning — data is part of standard module props interface
  void data
  void onDataChange

  const inp = (key: string, placeholder: string, width = 'w-16') => (
    <input
      type="number"
      className={`${width} border rounded px-1 py-0.5 text-xs dark:bg-gray-800`}
      value={inputs[key] ?? ''}
      onChange={(e) => setInput(key, e.target.value)}
      placeholder={placeholder}
      disabled={mode === 'build'}
    />
  )

  return (
    <div className="p-2 text-xs space-y-3 overflow-auto">
      {enabledCalculators.includes('anion-gap') ? (
        <div className="border rounded p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Anion Gap</span>
            <span className="text-lg font-bold font-mono">{fmt(anionGap)}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {inp('na', 'Na')} {inp('cl', 'Cl')} {inp('co2', 'CO₂')}
          </div>
          <p className="text-gray-400 italic text-[10px]">
            Emmett M &amp; Narins RG, Medicine 1977;56(1):38-54
          </p>
        </div>
      ) : null}

      {enabledCalculators.includes('map') ? (
        <div className="border rounded p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">MAP</span>
            <span className="text-lg font-bold font-mono">{fmt(map)}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {inp('sbp', 'SBP')} {inp('dbp', 'DBP')}
          </div>
          <p className="text-gray-400 italic text-[10px]">Magder S, Crit Care 2016</p>
        </div>
      ) : null}

      {enabledCalculators.includes('bmi') ? (
        <div className="border rounded p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">BMI</span>
            <span className="text-lg font-bold font-mono">{fmt(bmi)}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {inp('weight', 'kg')} {inp('height', 'm')}
          </div>
          <p className="text-gray-400 italic text-[10px]">WHO, 1995</p>
        </div>
      ) : null}

      {enabledCalculators.includes('aa-gradient') ? (
        <div className="border rounded p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">A-a Gradient</span>
            <span className="text-lg font-bold font-mono">{fmt(aaGrad)}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {inp('fio2', 'FiO₂ (0-1)')} {inp('paco2', 'PaCO₂')} {inp('pao2', 'PaO₂')}
          </div>
          <p className="text-gray-400 italic text-[10px]">
            Sorbini CA et al., Respiration 1968;25(1):3-13
          </p>
        </div>
      ) : null}

      {enabledCalculators.includes('ckd-epi') ? (
        <div className="border rounded p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">CKD-EPI GFR 2021</span>
            <span className="text-lg font-bold font-mono">{fmt(gfr)}</span>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {inp('cr', 'Cr')} {inp('age', 'Age')}
            <select
              className="border rounded px-1 py-0.5 text-xs dark:bg-gray-800"
              value={inputs['sex'] ?? ''}
              onChange={(e) => setInput('sex', e.target.value)}
              disabled={mode === 'build'}
            >
              <option value="">Sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <p className="text-gray-400 italic text-[10px]">
            Inker LA et al., NEJM 2021;385(19):1737-1749
          </p>
        </div>
      ) : null}

      {enabledCalculators.includes('corrected-calcium') ? (
        <div className="border rounded p-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Corrected Calcium</span>
            <span className="text-lg font-bold font-mono">{fmt(corrCa)}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {inp('measuredCa', 'Ca')} {inp('albumin', 'Albumin')}
          </div>
          <p className="text-gray-400 italic text-[10px]">
            Payne RB et al., BMJ 1973;4(5893):643-6
          </p>
        </div>
      ) : null}

      {customFormulas.length > 0 ? (
        <div>
          <p className="font-semibold mb-1">Custom Formulas</p>
          {customFormulas.map((f) => (
            <div key={f.id} className="border rounded p-2 mb-1">
              <div className="flex items-center justify-between">
                <span className="font-medium">{f.name}</span>
                <span className="text-lg font-bold font-mono">—</span>
              </div>
              <p className="text-gray-400 italic text-[10px]">{f.citation}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
