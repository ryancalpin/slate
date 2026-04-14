import React from 'react'
import type { FC } from 'react'

const CITATION = 'Freifeld AG et al. Clin Infect Dis. 2011;52(4):e56-e93'

interface NeutropenicFeverData {
  ancValue: number
  tempC: number
  masccItems: Record<string, boolean>
  coverageChecklist: Record<string, boolean>
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const MASCC_ITEMS: Array<{ key: string; label: string; points: number }> = [
  { key: 'mildSymptoms',       label: 'Burden of illness: mild/no symptoms',               points: 5 },
  { key: 'noHypotension',      label: 'No hypotension (SBP ≥90 mmHg)',                     points: 5 },
  { key: 'noCOPD',             label: 'No COPD',                                            points: 4 },
  { key: 'solidTumorNoFungal', label: 'Solid tumor OR no previous fungal infection',         points: 4 },
  { key: 'noDehydration',      label: 'No dehydration requiring IV fluids',                 points: 3 },
  { key: 'outpatientOnset',    label: 'Outpatient status at fever onset',                   points: 3 },
  { key: 'ageLt60',            label: 'Age <60 years',                                      points: 2 },
]

const COVERAGE_ITEMS: Array<{ key: string; label: string }> = [
  { key: 'gramNeg',     label: 'Gram-negative coverage (broad-spectrum beta-lactam)' },
  { key: 'gramPos',     label: 'Gram-positive coverage (if line infection / skin / mucositis / hemodynamic instability)' },
  { key: 'antifungal',  label: 'Antifungal (if >4 days persistent fever)' },
]

export function calcMASCC(items: Record<string, boolean>): number {
  return MASCC_ITEMS.reduce((sum, item) => sum + (items[item.key] ? item.points : 0), 0)
}

export const NeutropenicFeverRenderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as NeutropenicFeverData
  const masccItems = d.masccItems ?? {}
  const coverageChecklist = d.coverageChecklist ?? {}

  const anc = Number(d.ancValue ?? 0)
  const temp = Number(d.tempC ?? 0)
  const triggered = anc < 500 && temp > 38.3

  const score = calcMASCC(masccItems)
  const lowRisk = score >= 21

  const updateMascc = (key: string, value: boolean) => {
    onDataChange({ ...d, masccItems: { ...masccItems, [key]: value } })
  }

  const updateCoverage = (key: string, value: boolean) => {
    onDataChange({ ...d, coverageChecklist: { ...coverageChecklist, [key]: value } })
  }

  const updateNumeric = (field: 'ancValue' | 'tempC', value: number) => {
    onDataChange({ ...d, [field]: value })
  }

  return (
    <div className="p-3 space-y-4">
      {/* Trigger inputs */}
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2" htmlFor="anc-input">
          <span>ANC (×10³/µL)</span>
          <input
            id="anc-input"
            type="number"
            min={0}
            step={0.1}
            className="w-20 border rounded px-2 py-0.5 text-sm"
            value={d.ancValue ?? 0}
            onChange={e => updateNumeric('ancValue', Number(e.target.value))}
            aria-label="ANC"
          />
        </label>
        <label className="flex items-center gap-2" htmlFor="temp-input">
          <span>Temp (°C)</span>
          <input
            id="temp-input"
            type="number"
            min={35}
            max={42}
            step={0.1}
            className="w-20 border rounded px-2 py-0.5 text-sm"
            value={d.tempC ?? 0}
            onChange={e => updateNumeric('tempC', Number(e.target.value))}
            aria-label="Temp"
          />
        </label>
      </div>

      {/* Alert banner */}
      {triggered ? (
        <div className="rounded bg-red-100 border border-red-400 px-3 py-2 text-red-800 font-semibold text-sm">
          ⚠ Neutropenic Fever Criteria Met — ANC &lt;500 &amp; Temp &gt;38.3°C
        </div>
      ) : null}

      {/* MASCC Score */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">MASCC Score</span>
          <span className={`text-lg font-bold ${lowRisk ? 'text-green-600' : 'text-red-600'}`}>
            {score}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lowRisk ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {lowRisk ? 'Low Risk' : 'High Risk'}
          </span>
          <span className="text-xs text-gray-400">(score ≥21 = favorable)</span>
        </div>
        <div className="space-y-1">
          {MASCC_ITEMS.map(item => (
            <label key={item.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(masccItems[item.key])}
                onChange={e => updateMascc(item.key, e.target.checked)}
              />
              <span>{item.label}</span>
              <span className="ml-auto text-xs text-gray-400">+{item.points}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Empiric coverage checklist */}
      <div className="space-y-2 border-t pt-2">
        <div className="font-semibold text-sm">Empiric Coverage Checklist</div>
        <div className="space-y-1">
          {COVERAGE_ITEMS.map(item => (
            <label key={item.key} className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={Boolean(coverageChecklist[item.key])}
                onChange={e => updateCoverage(item.key, e.target.checked)}
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
