import type { FC } from 'react'
import { TIMI_ITEMS, calcTIMI, interpretGRACE, timiRisk } from './index'

const CITATION_TIMI = 'Antman EM et al. JAMA. 2000;284(7):835-842'
const CITATION_GRACE = 'Fox KA et al. Eur Heart J. 2006;27(24):2944-2947'

type CardiacData = { timiItems: boolean[]; graceScore: number; graceComponents: Record<string, number> }
const DEFAULT_DATA: CardiacData = { timiItems: Array(7).fill(false), graceScore: 0, graceComponents: {} }

interface Props { config: Record<string, unknown>; data: Record<string, unknown> }

const PrintView: FC<Props> = ({ config, data }) => {
  const title = (config.title as string) ?? 'Cardiac Risk Scores'
  const d: CardiacData = { ...DEFAULT_DATA, ...(data as Partial<CardiacData>) }
  const timiScore = calcTIMI(d.timiItems)
  const risk30day = timiRisk(timiScore)
  const graceRisk = d.graceScore > 0 ? interpretGRACE(d.graceScore) : '—'
  const checkedItems = TIMI_ITEMS.filter((_, i) => d.timiItems[i])

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 11, padding: 8 }}>
      <strong>{title}</strong>

      <p style={{ marginTop: 6, fontWeight: 'bold' }}>TIMI (UA/NSTEMI)</p>
      <p>Score: {timiScore} / 7 — 30-day event risk: {risk30day}</p>
      {checkedItems.length > 0 ? (
        <ul style={{ margin: '2px 0 2px 12px', padding: 0 }}>
          {checkedItems.map(item => <li key={item}>{item}</li>)}
        </ul>
      ) : null}
      <p style={{ fontSize: 9, fontStyle: 'italic', color: '#888' }}>{CITATION_TIMI}</p>

      <p style={{ marginTop: 6, fontWeight: 'bold' }}>GRACE (ACS)</p>
      <p>Total Score: {d.graceScore || '—'} — Risk: {graceRisk} {'(<108 low | 108-140 intermediate | >140 high)'}</p>
      <p style={{ fontSize: 9, fontStyle: 'italic', color: '#888' }}>{CITATION_GRACE}</p>
    </div>
  )
}

export default PrintView
