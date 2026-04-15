import type { FC } from 'react'
import { calcAKIStage } from './Renderer'

const CITATION = 'KDIGO Clinical Practice Guideline for Acute Kidney Injury. Kidney Int Suppl. 2012;2(1):1-138'

interface AKIData {
  baseCr: number; currCr: number; weightKg: number; uoMl: number
  timeHr: number; rrtInitiated: boolean; acuteRise48h: boolean
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as unknown as AKIData
  const uoRate = d.weightKg > 0 && d.timeHr > 0 ? d.uoMl / d.weightKg / d.timeHr : 0
  const stage = calcAKIStage(d.baseCr, d.currCr, uoRate, d.rrtInitiated)

  return (
    <div className="text-sm">
      <p className="font-bold mb-1">KDIGO AKI Staging — Stage {stage}</p>
      <table className="border-collapse text-xs">
        <tbody>
          <tr><td className="pr-4 font-medium text-gray-600">Baseline Cr</td><td>{d.baseCr} mg/dL</td></tr>
          <tr><td className="pr-4 font-medium text-gray-600">Current Cr</td><td>{d.currCr} mg/dL</td></tr>
          <tr><td className="pr-4 font-medium text-gray-600">UO Rate</td><td>{uoRate.toFixed(2)} mL/kg/h</td></tr>
          <tr><td className="pr-4 font-medium text-gray-600">RRT Initiated</td><td>{d.rrtInitiated ? 'Yes' : 'No'}</td></tr>
          <tr><td className="pr-4 font-medium text-gray-600">Acute Rise ≥0.3 (48h)</td><td>{d.acuteRise48h ? 'Yes' : 'No'}</td></tr>
        </tbody>
      </table>
      <p className="text-xs italic text-gray-400 mt-2">{CITATION}</p>
    </div>
  )
}
