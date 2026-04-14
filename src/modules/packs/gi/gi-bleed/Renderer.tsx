import React from 'react'

const GBS_CITATION = 'Glasgow-Blatchford Score — Blatchford O et al. Lancet. 2000;356(9238):1318-1321'
const ROCKALL_CITATION = 'Rockall TA et al. Gut. 1996;38(3):316-321'

export interface GBSInputs {
  sex: 'male' | 'female'
  bun: number
  hgb: number
  sbp: number
  hr: number
  melena: boolean
  syncope: boolean
  liverDisease: boolean
  heartFailure: boolean
}

export interface RockallInputs {
  age: number
  shock: 0 | 1 | 2
  comorbidity: 0 | 2 | 3
  diagnosis: 0 | 1 | 2
  majorSRH: boolean
}

export function calcGBS(inputs: GBSInputs): number {
  let score = 0

  // BUN
  if (inputs.bun >= 18.2 && inputs.bun <= 22.3) score += 2
  else if (inputs.bun >= 22.4 && inputs.bun <= 28) score += 3
  else if (inputs.bun >= 28.1 && inputs.bun <= 70) score += 4
  else if (inputs.bun > 70) score += 6

  // Hgb
  if (inputs.sex === 'male') {
    if (inputs.hgb >= 12 && inputs.hgb <= 12.9) score += 1
    else if (inputs.hgb >= 10 && inputs.hgb <= 11.9) score += 3
    else if (inputs.hgb < 10) score += 6
  } else {
    if (inputs.hgb >= 10 && inputs.hgb <= 11.9) score += 1
    else if (inputs.hgb < 10) score += 6
  }

  // SBP
  if (inputs.sbp >= 100 && inputs.sbp <= 109) score += 1
  else if (inputs.sbp >= 90 && inputs.sbp <= 99) score += 2
  else if (inputs.sbp < 90) score += 3

  // HR
  if (inputs.hr >= 100) score += 1

  // Other
  if (inputs.melena) score += 1
  if (inputs.syncope) score += 2
  if (inputs.liverDisease) score += 2
  if (inputs.heartFailure) score += 2

  return score
}

export function calcRockall(inputs: RockallInputs): number {
  let score = 0

  // Age
  if (inputs.age >= 60 && inputs.age <= 79) score += 1
  else if (inputs.age >= 80) score += 2

  // Shock
  score += inputs.shock

  // Comorbidity
  score += inputs.comorbidity

  // Diagnosis
  score += inputs.diagnosis

  // Major SRH
  if (inputs.majorSRH) score += 2

  return score
}

interface GiBleedData extends GBSInputs, RockallInputs {}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const GiBleedRenderer: React.FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as unknown as GiBleedData

  const gbsInputs: GBSInputs = {
    sex: d.sex ?? 'male',
    bun: d.bun ?? 0,
    hgb: d.hgb ?? 13,
    sbp: d.sbp ?? 120,
    hr: d.hr ?? 80,
    melena: d.melena ?? false,
    syncope: d.syncope ?? false,
    liverDisease: d.liverDisease ?? false,
    heartFailure: d.heartFailure ?? false,
  }

  const rockallInputs: RockallInputs = {
    age: d.age ?? 50,
    shock: d.shock ?? 0,
    comorbidity: d.comorbidity ?? 0,
    diagnosis: d.diagnosis ?? 0,
    majorSRH: d.majorSRH ?? false,
  }

  const gbs = calcGBS(gbsInputs)
  const rockall = calcRockall(rockallInputs)

  const gbsRisk = gbs === 0 ? 'Low risk — may not need endoscopy' : 'High risk — inpatient management'
  const gbsColor = gbs === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'

  const rockallRisk = rockall <= 1 ? 'Low' : rockall <= 3 ? 'Intermediate' : 'High'
  const rockallColor =
    rockall <= 1 ? 'text-green-600 dark:text-green-400' :
    rockall <= 3 ? 'text-yellow-600 dark:text-yellow-400' :
    'text-red-600 dark:text-red-400'

  const update = (field: string, value: unknown) => {
    onDataChange({ ...d, [field]: value })
  }

  return (
    <div className="p-3 space-y-5">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">GI Bleed Risk</h3>

      {/* GBS Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
            Pre-Endoscopy Triage Score
          </h4>
          <div className="text-right">
            <span className="text-lg font-bold text-blue-700 dark:text-blue-300">GBS: {gbs}</span>
            <p className={`text-xs font-semibold ${gbsColor}`}>{gbsRisk}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">Sex</label>
            <select
              value={d.sex ?? 'male'}
              onChange={e => update('sex', e.target.value)}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label htmlFor="gbs-bun" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
              BUN (mg/dL)
            </label>
            <input
              id="gbs-bun"
              type="number"
              min={0}
              step={0.1}
              value={d.bun ?? 0}
              onChange={e => update('bun', parseFloat(e.target.value) || 0)}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1"
            />
          </div>

          <div>
            <label htmlFor="gbs-hgb" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
              Hgb (g/dL)
            </label>
            <input
              id="gbs-hgb"
              type="number"
              min={0}
              step={0.1}
              value={d.hgb ?? 13}
              onChange={e => update('hgb', parseFloat(e.target.value) || 0)}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1"
            />
          </div>

          <div>
            <label htmlFor="gbs-sbp" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
              SBP (mmHg)
            </label>
            <input
              id="gbs-sbp"
              type="number"
              min={0}
              value={d.sbp ?? 120}
              onChange={e => update('sbp', parseInt(e.target.value) || 0)}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1"
            />
          </div>

          <div>
            <label htmlFor="gbs-hr" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
              HR (bpm)
            </label>
            <input
              id="gbs-hr"
              type="number"
              min={0}
              value={d.hr ?? 80}
              onChange={e => update('hr', parseInt(e.target.value) || 0)}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {[
            { field: 'melena', label: 'Melena' },
            { field: 'syncope', label: 'Syncope (+2)' },
            { field: 'liverDisease', label: 'Liver disease (+2)' },
            { field: 'heartFailure', label: 'Heart failure (+2)' },
          ].map(({ field, label }) => (
            <label key={field} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={((d as unknown as Record<string, unknown>)[field] as boolean) ?? false}
                onChange={e => update(field, e.target.checked)}
                disabled={mode === 'build'}
                className="rounded"
              />
              {label}
            </label>
          ))}
        </div>

        <p className="text-xs italic text-gray-400">{GBS_CITATION}</p>
      </div>

      {/* Rockall Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
            Post-Endoscopy Rebleed Risk
          </h4>
          <div className="text-right">
            <span className="text-lg font-bold text-purple-700 dark:text-purple-300">Score: {rockall}</span>
            <p className={`text-xs font-semibold ${rockallColor}`}>{rockallRisk} rebleed risk</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="rockall-age" className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">
              Age (years)
            </label>
            <input
              id="rockall-age"
              type="number"
              min={0}
              max={120}
              value={d.age ?? 50}
              onChange={e => update('age', parseInt(e.target.value) || 0)}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">Shock</label>
            <select
              value={d.shock ?? 0}
              onChange={e => update('shock', parseInt(e.target.value) as 0 | 1 | 2)}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1"
            >
              <option value={0}>No shock (SBP≥100, HR&lt;100)</option>
              <option value={1}>Tachycardia (HR≥100, SBP≥100)</option>
              <option value={2}>Hypotension (SBP&lt;100)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">Comorbidity</label>
            <select
              value={d.comorbidity ?? 0}
              onChange={e => update('comorbidity', parseInt(e.target.value) as 0 | 2 | 3)}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1"
            >
              <option value={0}>None</option>
              <option value={2}>Cardiac / renal / hepatic disease</option>
              <option value={3}>Metastatic cancer / renal or hepatic failure</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-0.5">Diagnosis</label>
            <select
              value={d.diagnosis ?? 0}
              onChange={e => update('diagnosis', parseInt(e.target.value) as 0 | 1 | 2)}
              disabled={mode === 'build'}
              className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs px-2 py-1"
            >
              <option value={0}>Mallory-Weiss / no SRH</option>
              <option value={1}>All other diagnoses</option>
              <option value={2}>GI malignancy</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          <input
            type="checkbox"
            checked={d.majorSRH ?? false}
            onChange={e => update('majorSRH', e.target.checked)}
            disabled={mode === 'build'}
            className="rounded"
          />
          Major SRH (active bleeding / visible vessel / clot) — +2
        </label>

        <p className="text-xs italic text-gray-400">{ROCKALL_CITATION}</p>
      </div>
    </div>
  )
}
