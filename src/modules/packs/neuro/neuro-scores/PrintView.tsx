import type { FC } from 'react'
import {
  calcGCS,
  CITATION_MRS,
  CITATION_GCS,
  CITATION_HUNT_HESS,
  CITATION_FISHER,
} from './Renderer'

const MRS_LABELS = [
  '0 — No symptoms',
  '1 — No significant disability',
  '2 — Slight disability',
  '3 — Moderate disability',
  '4 — Moderately severe disability',
  '5 — Severe disability',
  '6 — Dead',
]

const HUNT_HESS_LABELS = [
  '', 'I', 'II', 'III', 'IV', 'V',
]

interface Data {
  mrs: number
  gcsE: number
  gcsV: number
  gcsM: number
  huntHess: number
  fisherGrade: number
}

interface Props {
  config: Record<string, unknown>
  data: Data
}

export const PrintView: FC<Props> = ({ data }) => {
  const d: Data = {
    mrs: data.mrs ?? 0,
    gcsE: data.gcsE ?? 4,
    gcsV: data.gcsV ?? 5,
    gcsM: data.gcsM ?? 6,
    huntHess: data.huntHess ?? 1,
    fisherGrade: data.fisherGrade ?? 1,
  }
  const gcsTotal = calcGCS(d.gcsE, d.gcsV, d.gcsM)

  return (
    <div className="font-sans text-black text-sm space-y-2">
      <h3 className="font-bold text-base">Neuro Scores</h3>
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr className="border-b border-gray-300">
            <td className="py-0.5 pr-2 text-gray-600">mRS</td>
            <td className="py-0.5 font-semibold">{MRS_LABELS[d.mrs]}</td>
            <td className="py-0.5 text-right text-gray-400 text-xs italic">{CITATION_MRS}</td>
          </tr>
          <tr className="border-b border-gray-300">
            <td className="py-0.5 pr-2 text-gray-600">GCS</td>
            <td className="py-0.5 font-semibold">
              {gcsTotal} (E{d.gcsE}V{d.gcsV}M{d.gcsM})
            </td>
            <td className="py-0.5 text-right text-gray-400 text-xs italic">{CITATION_GCS}</td>
          </tr>
          <tr className="border-b border-gray-300">
            <td className="py-0.5 pr-2 text-gray-600">Hunt-Hess</td>
            <td className="py-0.5 font-semibold">Grade {HUNT_HESS_LABELS[d.huntHess]}</td>
            <td className="py-0.5 text-right text-gray-400 text-xs italic">{CITATION_HUNT_HESS}</td>
          </tr>
          <tr>
            <td className="py-0.5 pr-2 text-gray-600">Fisher Grade</td>
            <td className="py-0.5 font-semibold">Grade {d.fisherGrade}</td>
            <td className="py-0.5 text-right text-gray-400 text-xs italic">{CITATION_FISHER}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
