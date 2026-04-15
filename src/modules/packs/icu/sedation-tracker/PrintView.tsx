import type { FC } from 'react'
import { calcCPOT } from './Renderer'

const RASS_CITATION = 'Sessler CN et al. Am J Respir Crit Care Med. 2002;166(10):1338-1344'
const CPOT_CITATION = 'Gélinas C et al. Am J Crit Care. 2006;15(4):420-427'

const RASS_LABELS: Record<number, string> = {
  [-5]: 'Unarousable',
  [-4]: 'Deep sedation',
  [-3]: 'Moderate sedation',
  [-2]: 'Light sedation',
  [-1]: 'Drowsy',
  0: 'Alert & calm',
  1: 'Restless',
  2: 'Agitated',
  3: 'Very agitated',
  4: 'Combative',
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const SedationPrintView: FC<Props> = ({ data }) => {
  const rass = (data.rass as number) ?? 0
  const face = (data.cpotFace as number) ?? 0
  const body = (data.cpotBody as number) ?? 0
  const muscle = (data.cpotMuscle as number) ?? 0
  const compliance = (data.cpotCompliance as number) ?? 0
  const goalMin = (data.goalRassMin as number) ?? -2
  const goalMax = (data.goalRassMax as number) ?? 0
  const cpot = calcCPOT(face, body, muscle, compliance)
  const inGoal = rass >= goalMin && rass <= goalMax

  return (
    <div className="font-mono text-sm space-y-3">
      <h3 className="font-bold text-base">Sedation Tracker</h3>
      <div>
        <p>
          <strong>RASS:</strong> {rass} ({RASS_LABELS[rass] ?? 'Unknown'}){' '}
          <span className={inGoal ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>
            [{inGoal ? 'IN GOAL' : 'OUT OF GOAL'}]
          </span>
        </p>
        <p className="text-xs text-gray-500">Goal: {goalMin} to {goalMax}</p>
        <p className="text-xs italic text-gray-500 mt-1">{RASS_CITATION}</p>
      </div>
      <div>
        <p>
          <strong>CPOT:</strong> {cpot} / 8
        </p>
        <ul className="text-xs ml-4 space-y-0.5">
          <li>Facial Expression: {face}</li>
          <li>Body Movements: {body}</li>
          <li>Muscle Tension: {muscle}</li>
          <li>Compliance/Vocalization: {compliance}</li>
        </ul>
        <p className="text-xs italic text-gray-500 mt-1">{CPOT_CITATION}</p>
      </div>
    </div>
  )
}
