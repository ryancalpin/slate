import type { FC } from 'react'
import { classifyEF } from './index'

const CITATION = '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. JACC. 2022;79(17):e263-e421'

type EchoData = { ef: number; echoDate: string; lvedd: number; lvesd: number; wallMotion: string; valvular: string }
const DEFAULT_DATA: EchoData = { ef: 0, echoDate: '', lvedd: 0, lvesd: 0, wallMotion: '', valvular: '' }

interface Props { config: Record<string, unknown>; data: Record<string, unknown> }

const PrintView: FC<Props> = ({ config, data }) => {
  const title = (config.title as string) ?? 'Echo / EF Summary'
  const d: EchoData = { ...DEFAULT_DATA, ...(data as Partial<EchoData>) }
  const cls = d.ef > 0 ? classifyEF(d.ef) : '—'

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 11, padding: 8 }}>
      <strong>{title}</strong>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 4 }}>
        <tbody>
          <tr>
            <td style={{ paddingRight: 8, color: '#666' }}>EF</td>
            <td>{d.ef ? `${d.ef}% (${cls})` : '—'}</td>
            <td style={{ paddingRight: 8, color: '#666' }}>Echo Date</td>
            <td>{d.echoDate || '—'}</td>
          </tr>
          <tr>
            <td style={{ paddingRight: 8, color: '#666' }}>LVEDD</td>
            <td>{d.lvedd ? `${d.lvedd} mm` : '—'}</td>
            <td style={{ paddingRight: 8, color: '#666' }}>LVESD</td>
            <td>{d.lvesd ? `${d.lvesd} mm` : '—'}</td>
          </tr>
          <tr>
            <td style={{ paddingRight: 8, color: '#666' }}>Wall Motion</td>
            <td colSpan={3}>{d.wallMotion || '—'}</td>
          </tr>
          <tr>
            <td style={{ paddingRight: 8, color: '#666' }}>Valvular</td>
            <td colSpan={3}>{d.valvular || '—'}</td>
          </tr>
        </tbody>
      </table>
      <p style={{ fontSize: 9, fontStyle: 'italic', color: '#888', marginTop: 4 }}>{CITATION}</p>
    </div>
  )
}

export default PrintView
