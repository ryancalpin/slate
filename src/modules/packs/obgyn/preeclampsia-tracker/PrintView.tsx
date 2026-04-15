import type { FC } from 'react'
import { CITATION, calcMAP, hasSevereRange } from './index'

interface BPEntry { timestamp: string; systolic: number; diastolic: number }

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as { bpLog?: BPEntry[]; proteinuria?: boolean; severeFeatures?: Record<string, boolean>; magDrip?: Record<string, unknown> }
  const bpLog = d.bpLog ?? []
  const sf = d.severeFeatures ?? {}
  const mag = d.magDrip ?? {}
  const severeFlag = hasSevereRange(bpLog.map(r => ({ sbp: r.systolic, dbp: r.diastolic, timestamp: r.timestamp })))

  const sfLabels: Record<string, string> = {
    thrombocytopenia: 'Thrombocytopenia',
    impairedRenal: 'Impaired Renal',
    impairedLiver: 'Impaired Liver',
    pulmonaryEdema: 'Pulmonary Edema',
    severeHeadache: 'Severe Headache',
    visualDisturbances: 'Visual Disturbances',
  }

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold">Preeclampsia Tracker</h3>
      {severeFlag ? <p className="font-bold text-red-600">SEVERE RANGE DETECTED</p> : null}
      <div>
        <strong>BP Log:</strong>
        {bpLog.length === 0 ? ' None' : (
          <table className="text-xs mt-1 w-full">
            <thead><tr><th className="text-left">Time</th><th>SBP</th><th>DBP</th><th>MAP</th></tr></thead>
            <tbody>
              {bpLog.map((r, i) => (
                <tr key={i}>
                  <td>{new Date(r.timestamp).toLocaleTimeString()}</td>
                  <td>{r.systolic}</td>
                  <td>{r.diastolic}</td>
                  <td>{calcMAP(r.systolic, r.diastolic).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p>Proteinuria: {d.proteinuria ? 'Yes' : 'No'}</p>
      <p>Severe Features: {Object.entries(sf).filter(([, v]) => v).map(([k]) => sfLabels[k] ?? k).join(', ') || 'None'}</p>
      <p>Mag Drip — Loading: {mag.loadingDone ? 'Given' : 'Not given'} | Maintenance: {String(mag.maintenanceRate ?? '—')} g/hr | UOP: {String(mag.urineOutput ?? '—')} mL/hr | Reflexes: {String(mag.reflexes ?? '—')} | RR: {String(mag.respiratoryRate ?? '—')}</p>
      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
