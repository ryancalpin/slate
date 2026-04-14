import type { FC } from 'react'
import { calcPercentTarget } from './index'

const CITATION = '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. JACC. 2022;79(17):e263-e421'

type DrugRow = { drug: string; currentDose: number; targetDose: number; unit: string; active: boolean }
type GdmtData = { betaBlocker: DrugRow; aceArb: DrugRow; mra: DrugRow; sglt2i: DrugRow }

const ROW_LABELS: [keyof GdmtData, string][] = [
  ['betaBlocker', 'Beta-blocker'],
  ['aceArb', 'ACEi/ARB/ARNI'],
  ['mra', 'MRA'],
  ['sglt2i', 'SGLT2i'],
]

const DEFAULT_ROW: DrugRow = { drug: '', currentDose: 0, targetDose: 0, unit: 'mg/day', active: true }
const DEFAULT_DATA: GdmtData = {
  betaBlocker: { ...DEFAULT_ROW, unit: 'mg BID' },
  aceArb: { ...DEFAULT_ROW },
  mra: { ...DEFAULT_ROW },
  sglt2i: { ...DEFAULT_ROW },
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

const PrintView: FC<Props> = ({ config, data }) => {
  const title = (config.title as string) ?? 'GDMT Tracker'
  const d: GdmtData = { ...DEFAULT_DATA, ...(data as Partial<GdmtData>) }

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 11, padding: 8 }}>
      <strong>{title}</strong>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 4 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>
            <th style={{ paddingRight: 6 }}>Class</th>
            <th style={{ paddingRight: 6 }}>Drug</th>
            <th style={{ paddingRight: 6 }}>Current</th>
            <th style={{ paddingRight: 6 }}>Target</th>
            <th style={{ paddingRight: 6 }}>Unit</th>
            <th style={{ paddingRight: 6 }}>% Target</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {ROW_LABELS.map(([key, label]) => {
            const row = d[key]
            const p = calcPercentTarget(row.currentDose, row.targetDose)
            return (
              <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ paddingRight: 6 }}>{label}</td>
                <td style={{ paddingRight: 6 }}>{row.drug || '—'}</td>
                <td style={{ paddingRight: 6 }}>{row.currentDose}</td>
                <td style={{ paddingRight: 6 }}>{row.targetDose}</td>
                <td style={{ paddingRight: 6 }}>{row.unit}</td>
                <td style={{ paddingRight: 6 }}>{p}%</td>
                <td>{row.active ? 'Yes' : 'No'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p style={{ fontSize: 9, fontStyle: 'italic', color: '#888', marginTop: 4 }}>{CITATION}</p>
    </div>
  )
}

export default PrintView
