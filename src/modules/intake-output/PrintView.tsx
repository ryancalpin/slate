import type { FC } from 'react'
import { calcUOP, calcNetBalance } from './Renderer'

interface FluidEntry { label: string; ml: number }
interface IOData {
  po: number
  ivFluids: FluidEntry[]
  urine: number
  urineHours: number
  stool: number
  drains: FluidEntry[]
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ config, data }) => {
  const cfg = config as { showUOP?: boolean; windowLabel?: string }
  const d = data as Partial<IOData>
  const po = d.po ?? 0
  const ivFluids: FluidEntry[] = d.ivFluids ?? []
  const urine = d.urine ?? 0
  const urineHours = d.urineHours ?? 0
  const stool = d.stool ?? 0
  const drains: FluidEntry[] = d.drains ?? []
  const uop = calcUOP(urine, urineHours)
  const net = calcNetBalance(d)

  return (
    <div className="p-2 text-sm">
      {cfg.windowLabel && <h4 className="font-semibold mb-2">{cfg.windowLabel}</h4>}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h5 className="font-semibold text-blue-700 border-b border-gray-300 mb-1">Intake</h5>
          <div className="flex justify-between"><span>PO</span><span>{po} mL</span></div>
          {ivFluids.map((iv, i) => (
            <div key={i} className="flex justify-between">
              <span>{iv.label || `IV ${i + 1}`}</span>
              <span>{iv.ml} mL</span>
            </div>
          ))}
        </div>
        <div>
          <h5 className="font-semibold text-orange-700 border-b border-gray-300 mb-1">Output</h5>
          <div className="flex justify-between">
            <span>Urine</span>
            <span>{urine} mL{cfg.showUOP !== false && urineHours > 0 ? ` (${uop} mL/hr)` : ''}</span>
          </div>
          <div className="flex justify-between"><span>Stool</span><span>{stool} mL</span></div>
          {drains.map((dr, i) => (
            <div key={i} className="flex justify-between">
              <span>{dr.label || `Drain ${i + 1}`}</span>
              <span>{dr.ml} mL</span>
            </div>
          ))}
        </div>
      </div>
      <div className={`text-right font-semibold mt-2 pt-1 border-t border-gray-300 ${net >= 0 ? 'text-green-700' : 'text-red-600'}`}>
        Net Balance: {net >= 0 ? '+' : ''}{net} mL
      </div>
    </div>
  )
}
