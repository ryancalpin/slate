import type { FC } from 'react'
import {
  CITATION_WINTERS,
  CITATION_AA,
  interpretABG,
  calcAaGradient,
  calcPFRatio,
} from './index'

interface ABGData {
  ph: number; pco2: number; pao2: number; hco3: number; spo2: number; fio2: number; patientAge: number
}
interface Props { config: Record<string, unknown>; data: Record<string, unknown> }

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as Partial<ABGData>
  const interpretation = d.ph != null && d.pco2 != null && d.hco3 != null
    ? interpretABG(d.ph, d.pco2, d.hco3)
    : null
  const aaGradient = d.fio2 != null && d.pco2 != null && d.pao2 != null
    ? calcAaGradient(d.fio2, d.pco2, d.pao2)
    : null
  const pfRatio = d.pao2 != null && d.fio2 != null && d.fio2 > 0
    ? calcPFRatio(d.pao2, d.fio2)
    : null

  const rows: [string, string][] = [
    ['pH', d.ph?.toString() ?? '—'],
    ['PaCO₂', d.pco2 != null ? `${d.pco2} mmHg` : '—'],
    ['PaO₂', d.pao2 != null ? `${d.pao2} mmHg` : '—'],
    ['HCO₃', d.hco3 != null ? `${d.hco3} mEq/L` : '—'],
    ['SpO₂', d.spo2 != null ? `${d.spo2}%` : '—'],
    ['FiO₂', d.fio2 != null ? `${d.fio2}%` : '—'],
    ['Interpretation', interpretation ? (interpretation.disorder === 'Normal' ? 'Normal' : `${interpretation.type} ${interpretation.disorder}`) : '—'],
    ['A-a Gradient', aaGradient != null ? `${aaGradient.toFixed(1)} mmHg` : '—'],
    ['P/F Ratio', pfRatio != null ? pfRatio.toFixed(0) : '—'],
  ]

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
      <h4 style={{ marginBottom: 6, fontWeight: 600 }}>ABG Interpretation</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '3px 6px', color: '#6b7280', width: '50%' }}>{label}</td>
              <td style={{ padding: '3px 6px', fontWeight: 500 }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ color: '#9ca3af', fontSize: 10, fontStyle: 'italic', marginTop: 4 }}>{CITATION_WINTERS}</p>
      <p style={{ color: '#9ca3af', fontSize: 10, fontStyle: 'italic' }}>{CITATION_AA}</p>
    </div>
  )
}
