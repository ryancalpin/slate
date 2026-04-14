import type { FC } from 'react'
import { calcCHADS2VASc, calcHASBLED } from './index'

const CITATION_CHADS = 'Lip GY et al. Chest. 2010;137(2):263-272'
const CITATION_HASBLED = 'Pisters R et al. Chest. 2010;138(5):1093-1100'

type PacerSettings = { mode: string; rate: number; output: number; sensitivity: number }
type RhythmData = { rhythm: string; pacer?: PacerSettings; chadsItems: Record<string, boolean>; hasbledItems: Record<string, boolean> }
const DEFAULT_DATA: RhythmData = { rhythm: 'NSR', chadsItems: {}, hasbledItems: {} }

interface Props { config: Record<string, unknown>; data: Record<string, unknown> }

const PrintView: FC<Props> = ({ config, data }) => {
  const title = (config.title as string) ?? 'Rhythm & Pacemaker'
  const d: RhythmData = { ...DEFAULT_DATA, ...(data as Partial<RhythmData>) }
  const chadsScore = calcCHADS2VASc(d.chadsItems)
  const hasbledScore = calcHASBLED(d.hasbledItems)
  const showPacer = d.rhythm === 'Paced' || d.rhythm.includes('AV Block')

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: 11, padding: 8 }}>
      <strong>{title}</strong>
      <p style={{ marginTop: 4 }}><strong>Rhythm:</strong> {d.rhythm}</p>
      {showPacer && d.pacer ? (
        <p><strong>Pacemaker:</strong> Mode {d.pacer.mode} | Rate {d.pacer.rate} bpm | Output {d.pacer.output} mA | Sensitivity {d.pacer.sensitivity} mV</p>
      ) : null}
      <p style={{ marginTop: 4 }}>
        <strong>CHADS₂-VASc:</strong> {chadsScore} — {chadsScore === 0 ? 'Low' : chadsScore === 1 ? 'Intermediate' : 'High risk'}
      </p>
      <p style={{ fontSize: 9, fontStyle: 'italic', color: '#888' }}>{CITATION_CHADS}</p>
      <p style={{ marginTop: 4 }}>
        <strong>HAS-BLED:</strong> {hasbledScore} — {hasbledScore >= 3 ? 'High bleeding risk' : 'Low bleeding risk'}
      </p>
      <p style={{ fontSize: 9, fontStyle: 'italic', color: '#888' }}>{CITATION_HASBLED}</p>
    </div>
  )
}

export default PrintView
