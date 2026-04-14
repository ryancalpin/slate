import React from 'react'
import { calcGBS, calcRockall } from './Renderer'
import type { GBSInputs, RockallInputs } from './Renderer'

const GBS_CITATION = 'Blatchford O et al. Lancet. 2000;356(9238):1318-1321'
const ROCKALL_CITATION = 'Rockall TA et al. Gut. 1996;38(3):316-321'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const GiBleedPrintView: React.FC<Props> = ({ data }) => {
  const d = data as unknown as GBSInputs & RockallInputs
  const gbs = calcGBS(d)
  const rockall = calcRockall(d)

  return (
    <div className="print-module">
      <h3 className="font-semibold text-sm mb-2">GI Bleed Risk Scores</h3>
      <p className="text-xs font-medium">Glasgow-Blatchford Score (GBS): {gbs}</p>
      <p className="text-xs mb-1">
        {gbs === 0 ? 'Low risk — may not need endoscopy' : 'High risk — inpatient management'}
      </p>
      <p className="text-xs italic text-gray-500 mb-2">{GBS_CITATION}</p>
      <p className="text-xs font-medium">Rockall Score: {rockall}</p>
      <p className="text-xs mb-1">
        {rockall <= 1 ? 'Low' : rockall <= 3 ? 'Intermediate' : 'High'} rebleed risk
      </p>
      <p className="text-xs italic text-gray-500">{ROCKALL_CITATION}</p>
    </div>
  )
}
