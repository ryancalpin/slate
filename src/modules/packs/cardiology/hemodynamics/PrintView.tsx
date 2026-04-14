import type { FC } from 'react'
import { HEMO_PARAMS } from './index'

type HemoData = Record<string, number>
const DEFAULT_DATA: HemoData = { ci: 0, pcwp: 0, svr: 0, map: 0, cvp: 0, paSys: 0, paDias: 0, paMean: 0 }

interface Props { config: Record<string, unknown>; data: Record<string, unknown> }

const PrintView: FC<Props> = ({ config, data }) => {
  const title = (config.title as string) ?? 'Hemodynamics'
  const d: HemoData = { ...DEFAULT_DATA, ...(data as Record<string, number>) }

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 11, padding: 8 }}>
      <strong>{title}</strong>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 4 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>
            <th style={{ paddingRight: 8 }}>Parameter</th>
            <th style={{ paddingRight: 8 }}>Value</th>
            <th style={{ paddingRight: 8 }}>Unit</th>
            <th>Normal</th>
          </tr>
        </thead>
        <tbody>
          {HEMO_PARAMS.map(p => {
            const val = d[p.key] ?? 0
            const outOfRange = val > 0 && (val < p.low || val > p.high)
            return (
              <tr key={p.key} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ paddingRight: 8 }}>{p.label}</td>
                <td style={{ paddingRight: 8, color: outOfRange ? '#b45309' : 'inherit', fontWeight: outOfRange ? 'bold' : 'normal' }}>
                  {val || '—'}
                </td>
                <td style={{ paddingRight: 8, color: '#666' }}>{p.unit}</td>
                <td style={{ color: '#666' }}>{p.low}–{p.high}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default PrintView
