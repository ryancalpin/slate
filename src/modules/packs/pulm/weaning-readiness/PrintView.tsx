import type { FC } from 'react'
import { CITATION, WEAN_CHECKLIST_ITEMS, calcRSBI } from './index'

interface SBTEntry { date: string; duration: number; outcome: 'pass' | 'fail'; reason: string }
interface WeanData { weanChecklist: Record<string, boolean>; rsbiRR: number; rsbiTV: number; sbtLog: SBTEntry[] }
interface Props { config: Record<string, unknown>; data: Record<string, unknown> }

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as Partial<WeanData>
  const checklist = d.weanChecklist ?? {}
  const sbtLog = (d.sbtLog ?? []) as SBTEntry[]
  const rsbi = d.rsbiRR != null && d.rsbiTV != null && d.rsbiTV > 0
    ? calcRSBI(d.rsbiRR, d.rsbiTV)
    : null

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 12 }}>
      <h4 style={{ fontWeight: 600, marginBottom: 4 }}>Weaning Readiness</h4>

      <p style={{ fontWeight: 600, marginBottom: 2 }}>Daily Wean Screen</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 6 }}>
        <tbody>
          {WEAN_CHECKLIST_ITEMS.map(({ key, label }) => (
            <tr key={key} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '2px 6px', color: '#6b7280' }}>{label}</td>
              <td style={{ padding: '2px 6px', fontWeight: 500 }}>{checklist[key] ? '✓' : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ fontWeight: 600, marginBottom: 2 }}>RSBI</p>
      <p style={{ marginBottom: 2 }}>
        RR: {d.rsbiRR ?? '—'} br/min | TV: {d.rsbiTV ?? '—'} mL
      </p>
      {rsbi != null && (
        <p style={{ fontWeight: 700, marginBottom: 2 }}>
          RSBI: {rsbi.toFixed(1)} — {rsbi < 105 ? 'Favorable (<105)' : 'Unfavorable (≥105)'}
        </p>
      )}
      <p style={{ fontSize: 10, fontStyle: 'italic', color: '#9ca3af', marginBottom: 8 }}>{CITATION}</p>

      {sbtLog.length > 0 && (
        <>
          <p style={{ fontWeight: 600, marginBottom: 2 }}>SBT Log</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #d1d5db' }}>
                {['Date', 'Duration (min)', 'Outcome', 'Reason'].map((h) => (
                  <th key={h} style={{ padding: '2px 6px', textAlign: 'left', color: '#6b7280', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sbtLog.map((e, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '2px 6px' }}>{e.date}</td>
                  <td style={{ padding: '2px 6px' }}>{e.duration}</td>
                  <td style={{ padding: '2px 6px', fontWeight: 600, color: e.outcome === 'pass' ? '#16a34a' : '#dc2626' }}>{e.outcome}</td>
                  <td style={{ padding: '2px 6px', color: '#6b7280' }}>{e.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
