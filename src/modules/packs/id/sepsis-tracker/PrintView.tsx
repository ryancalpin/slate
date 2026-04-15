import { calcQSOFA } from './Renderer'

const CITATION = 'Sepsis-3 Consensus: Singer M et al. JAMA 2016;315(8):801-810'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export function SepsisPrintView({ data }: Props) {
  const d = data as {
    rrHigh: boolean
    ams: boolean
    sbpLow: boolean
    suspectedInfection: boolean
    sofaDelta: number
  }
  const score = calcQSOFA(d.rrHigh, d.ams, d.sbpLow)

  return (
    <div className="p-2 text-xs">
      <h3 className="font-bold mb-1">Sepsis Tracker (qSOFA / Sepsis-3)</h3>
      <p>RR ≥ 22: {d.rrHigh ? 'Yes' : 'No'}</p>
      <p>Altered mental status: {d.ams ? 'Yes' : 'No'}</p>
      <p>SBP ≤ 100: {d.sbpLow ? 'Yes' : 'No'}</p>
      <p className="font-bold mt-1">qSOFA Score: {score}</p>
      {score >= 2 && <p className="text-red-700 font-semibold">qSOFA ≥2: Consider sepsis workup</p>}
      <div className="mt-2 border-t border-gray-300 pt-1">
        <p>Suspected infection: {d.suspectedInfection ? 'Yes' : 'No'}</p>
        <p>SOFA delta: {d.sofaDelta}</p>
        {d.suspectedInfection && d.sofaDelta >= 2 && (
          <p className="font-bold text-orange-700">Meets Sepsis-3 criteria</p>
        )}
      </div>
      <p className="text-gray-400 italic mt-2">{CITATION}</p>
    </div>
  )
}
