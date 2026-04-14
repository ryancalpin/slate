import type { FC } from 'react'
import { CITATION_CURB65, CITATION_BERLIN, calcCURB65, curb65Risk, berlinClassify } from './index'

const CURB65_LABELS = [
  'Confusion', 'BUN >19 mg/dL', 'RR ≥30', 'SBP <90 or DBP ≤60', 'Age ≥65',
]

interface RSData {
  curb65: boolean[]; berlinOnset: boolean; berlinRadio: boolean; berlinNotCardiac: boolean; pf: number; peep: number
}
interface Props { config: Record<string, unknown>; data: Record<string, unknown> }

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as Partial<RSData>
  const curb = (d.curb65 ?? []) as boolean[]
  const score = calcCURB65(curb)
  const risk = curb65Risk(score)
  const allBerlin = !!(d.berlinOnset && d.berlinRadio && d.berlinNotCardiac)
  const berlinGrade = allBerlin && d.pf != null && d.peep != null ? berlinClassify(d.pf, d.peep) : null

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
      <h4 style={{ fontWeight: 600, marginBottom: 4 }}>CURB-65</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 4 }}>
        <tbody>
          {CURB65_LABELS.map((label, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '2px 6px', color: '#6b7280' }}>{label}</td>
              <td style={{ padding: '2px 6px', fontWeight: 500 }}>{curb[i] ? 'Yes (+1)' : 'No'}</td>
            </tr>
          ))}
          <tr>
            <td style={{ padding: '2px 6px', fontWeight: 600 }}>Score</td>
            <td style={{ padding: '2px 6px', fontWeight: 700 }}>{score} / 5 — {risk.label} risk</td>
          </tr>
        </tbody>
      </table>
      <p style={{ fontSize: 10, fontStyle: 'italic', color: '#9ca3af', marginBottom: 8 }}>{CITATION_CURB65}</p>

      <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Berlin ARDS Criteria</h4>
      <p style={{ marginBottom: 2 }}>
        Onset criteria: {d.berlinOnset ? 'Met' : 'Not met'} |{' '}
        Radiologic: {d.berlinRadio ? 'Met' : 'Not met'} |{' '}
        Non-cardiac: {d.berlinNotCardiac ? 'Met' : 'Not met'}
      </p>
      <p style={{ marginBottom: 2 }}>
        P/F: {d.pf ?? '—'} | PEEP: {d.peep ?? '—'} cmH₂O
      </p>
      <p style={{ fontWeight: 700 }}>
        Classification: {berlinGrade ?? (allBerlin ? 'Does not meet ARDS threshold' : 'Criteria not met')}
      </p>
      <p style={{ fontSize: 10, fontStyle: 'italic', color: '#9ca3af', marginTop: 4 }}>{CITATION_BERLIN}</p>
    </div>
  )
}
