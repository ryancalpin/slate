import type { FC } from 'react'
import type { WoundAssessmentData } from './index'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as WoundAssessmentData

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold text-base border-b pb-1">Wound Assessment</h3>
      <p><span className="font-semibold">Location:</span> {d.location}</p>
      <p><span className="font-semibold">Type:</span> {d.woundType}</p>
      {d.vac && (
        <div className="pl-3 border-l-2 border-blue-300 space-y-0.5">
          <p className="font-semibold text-xs">VAC Settings</p>
          <p className="text-xs">Mode: {d.vac.mode} | Pressure: {d.vac.pressure} cmH₂O | Dressing change: {d.vac.dressingDate || '—'}</p>
        </div>
      )}
      <p><span className="font-semibold">Dehiscence:</span> {d.dehiscence}</p>
      <p><span className="font-semibold">Description:</span> {d.description}</p>
      <p><span className="font-semibold">Assessment Date:</span> {d.assessmentDate}</p>
    </div>
  )
}
