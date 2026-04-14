import React from 'react'
import { calcMELD, calcMELDNa } from './Renderer'

const CITATION = 'Kim WR et al. Hepatology. 2008;48(4):1362-1370'

interface MeldNaData {
  creatinine: number
  bilirubin: number
  inr: number
  sodium: number
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const MeldNaPrintView: React.FC<Props> = ({ data }) => {
  const d = data as unknown as MeldNaData
  const meld = calcMELD(d.creatinine ?? 1, d.bilirubin ?? 1, d.inr ?? 1)
  const meldNa = calcMELDNa(meld, d.sodium ?? 137)

  return (
    <div className="print-module">
      <h3 className="font-semibold text-sm mb-2">MELD / MELD-Na</h3>
      <table className="text-xs mb-2">
        <tbody>
          <tr><td className="pr-4 font-medium">Creatinine:</td><td>{d.creatinine ?? 1} mg/dL</td></tr>
          <tr><td className="pr-4 font-medium">Bilirubin:</td><td>{d.bilirubin ?? 1} mg/dL</td></tr>
          <tr><td className="pr-4 font-medium">INR:</td><td>{d.inr ?? 1}</td></tr>
          <tr><td className="pr-4 font-medium">Sodium:</td><td>{d.sodium ?? 137} mEq/L</td></tr>
        </tbody>
      </table>
      <p className="text-sm font-bold">MELD: {meld} &nbsp;|&nbsp; MELD-Na: {meldNa}</p>
      <p className="text-xs italic text-gray-500 mt-1">{CITATION}</p>
    </div>
  )
}
