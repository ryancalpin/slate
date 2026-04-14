import type { FC } from 'react'
import { CITATION, calcDrivingPressure, calcPFRatio, calcTVperIBW } from './index'

interface VentData {
  mode: string
  fio2: number
  peep: number
  tv: number
  rr: number
  ie: string
  pPlat: number
  pao2: number
  ibwKg: number
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as Partial<VentData>

  const drivingPressure = d.pPlat != null && d.peep != null ? calcDrivingPressure(d.pPlat, d.peep) : null
  const pfRatio = d.pao2 != null && d.fio2 != null && d.fio2 > 0 ? calcPFRatio(d.pao2, d.fio2 / 100) : null
  const tvIBW = d.tv != null && d.ibwKg != null && d.ibwKg > 0 ? calcTVperIBW(d.tv, d.ibwKg) : null

  const rows: [string, string][] = [
    ['Mode', d.mode ?? '—'],
    ['FiO₂', d.fio2 != null ? `${d.fio2}%` : '—'],
    ['PEEP', d.peep != null ? `${d.peep} cmH₂O` : '—'],
    ['Tidal Volume', d.tv != null ? `${d.tv} mL` : '—'],
    ['Set RR', d.rr != null ? `${d.rr} br/min` : '—'],
    ['I:E Ratio', d.ie ?? '—'],
    ['P-plateau', d.pPlat != null ? `${d.pPlat} cmH₂O` : '—'],
    ['PaO₂', d.pao2 != null ? `${d.pao2} mmHg` : '—'],
    ['IBW', d.ibwKg != null ? `${d.ibwKg} kg` : '—'],
    ['Driving Pressure (calc)', drivingPressure != null ? `${drivingPressure} cmH₂O` : '—'],
    ['P/F Ratio (calc)', pfRatio != null ? pfRatio.toFixed(0) : '—'],
    ['TV/IBW (calc)', tvIBW != null ? `${tvIBW.toFixed(1)} mL/kg` : '—'],
  ]

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
      <h4 style={{ marginBottom: 6, fontWeight: 600 }}>Ventilator Settings</h4>
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
      {tvIBW != null && tvIBW > 6 && (
        <p style={{ color: '#d97706', marginTop: 6, fontSize: 11 }}>
          ⚠ TV exceeds ARDSnet target (6 mL/kg IBW)
        </p>
      )}
      <p style={{ color: '#9ca3af', fontSize: 10, fontStyle: 'italic', marginTop: 6 }}>{CITATION}</p>
    </div>
  )
}
