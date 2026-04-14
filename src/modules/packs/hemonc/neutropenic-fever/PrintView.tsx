import React from 'react'
import type { FC } from 'react'
import { calcMASCC } from './Renderer'

const CITATION = 'Freifeld AG et al. Clin Infect Dis. 2011;52(4):e56-e93'

const MASCC_ITEMS = [
  { key: 'mildSymptoms',       label: 'Mild/no symptoms',                        points: 5 },
  { key: 'noHypotension',      label: 'No hypotension',                          points: 5 },
  { key: 'noCOPD',             label: 'No COPD',                                 points: 4 },
  { key: 'solidTumorNoFungal', label: 'Solid tumor / no prior fungal infection', points: 4 },
  { key: 'noDehydration',      label: 'No IV dehydration',                       points: 3 },
  { key: 'outpatientOnset',    label: 'Outpatient onset',                        points: 3 },
  { key: 'ageLt60',            label: 'Age <60',                                 points: 2 },
]

const COVERAGE_ITEMS = [
  { key: 'gramNeg',    label: 'Gram-negative (broad-spectrum beta-lactam)' },
  { key: 'gramPos',    label: 'Gram-positive (if indicated)' },
  { key: 'antifungal', label: 'Antifungal (if >4 days persistent fever)' },
]

interface NeutropenicFeverData {
  ancValue: number
  tempC: number
  masccItems: Record<string, boolean>
  coverageChecklist: Record<string, boolean>
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const NeutropenicFeverPrintView: FC<Props> = ({ data }) => {
  const d = data as NeutropenicFeverData
  const masccItems = d.masccItems ?? {}
  const coverageChecklist = d.coverageChecklist ?? {}
  const score = calcMASCC(masccItems)
  const lowRisk = score >= 21
  const triggered = Number(d.ancValue) < 500 && Number(d.tempC) > 38.3

  return (
    <div className="text-xs space-y-2">
      <div className="font-bold text-sm">Neutropenic Fever Assessment</div>
      <div className="flex gap-4">
        <span>ANC: {d.ancValue} ×10³/µL</span>
        <span>Temp: {d.tempC}°C</span>
        {triggered ? <span className="font-bold text-red-700">⚠ Criteria Met</span> : null}
      </div>
      <div>
        <span className="font-semibold">MASCC Score: {score} — </span>
        <span className={lowRisk ? 'text-green-700' : 'text-red-700'}>
          {lowRisk ? 'Low Risk (≥21)' : 'High Risk (<21)'}
        </span>
      </div>
      <table className="w-full border-collapse">
        <tbody>
          {MASCC_ITEMS.map(item => (
            <tr key={item.key} className="border-b last:border-0">
              <td className="py-0.5 pr-2">{masccItems[item.key] ? '☑' : '☐'}</td>
              <td className="py-0.5 pr-2">{item.label}</td>
              <td className="py-0.5 text-right">+{item.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="font-semibold mt-1">Empiric Coverage</div>
      {COVERAGE_ITEMS.map(item => (
        <div key={item.key} className="flex gap-2">
          <span>{coverageChecklist[item.key] ? '☑' : '☐'}</span>
          <span>{item.label}</span>
        </div>
      ))}
      <p className="text-gray-400 italic mt-2">{CITATION}</p>
    </div>
  )
}
