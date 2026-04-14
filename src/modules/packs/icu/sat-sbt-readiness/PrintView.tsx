import React, { FC } from 'react'

const CITATION = 'Girard TD et al. Lancet. 2008;371(9607):126-134'

const SAT_ITEMS = [
  { key: 'noAgitation', label: 'No agitation' },
  { key: 'noSeizures', label: 'No active seizures' },
  { key: 'noWithdrawal', label: 'No alcohol/benzo withdrawal' },
  { key: 'noParalytic', label: 'No active paralytic infusion' },
  { key: 'noElevatedICP', label: 'No elevated ICP' },
  { key: 'noHighFiO2', label: 'No FiO2 > 50% or PEEP > 8 (NMD)' },
]

const SBT_ITEMS = [
  { key: 'fio2Ok', label: 'FiO2 ≤ 50%' },
  { key: 'peepOk', label: 'PEEP ≤ 8 cmH2O' },
  { key: 'noVasopressors', label: 'No vasopressors (or minimal)' },
  { key: 'passedSat', label: 'Passed SAT' },
  { key: 'coughOk', label: 'Adequate cough / secretions manageable' },
]

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const SatSbtPrintView: FC<Props> = ({ data }) => {
  const satScreen = (data.satScreen as Record<string, boolean>) ?? {}
  const sbtScreen = (data.sbtScreen as Record<string, boolean>) ?? {}
  const lastSatDate = (data.lastSatDate as string) ?? ''
  const lastSbtDate = (data.lastSbtDate as string) ?? ''
  const lastSbtPassed = (data.lastSbtPassed as boolean) ?? false

  const satPassed = SAT_ITEMS.every((i) => satScreen[i.key])
  const sbtPassed = SBT_ITEMS.every((i) => sbtScreen[i.key])

  return (
    <div className="font-mono text-sm space-y-3">
      <h3 className="font-bold text-base">SAT / SBT Readiness</h3>

      <div>
        <p className="font-semibold">
          SAT Safety Screen: <span className={satPassed ? 'text-green-700' : 'text-red-700'}>{satPassed ? 'PASS' : 'FAIL'}</span>
        </p>
        <ul className="ml-4 text-xs space-y-0.5">
          {SAT_ITEMS.map((item) => (
            <li key={item.key}>
              [{satScreen[item.key] ? 'X' : ' '}] {item.label}
            </li>
          ))}
        </ul>
        {lastSatDate && <p className="text-xs text-gray-500">Last SAT: {lastSatDate}</p>}
      </div>

      <div>
        <p className="font-semibold">
          SBT Safety Screen: <span className={sbtPassed ? 'text-green-700' : 'text-red-700'}>{sbtPassed ? 'PASS' : 'FAIL'}</span>
        </p>
        <ul className="ml-4 text-xs space-y-0.5">
          {SBT_ITEMS.map((item) => (
            <li key={item.key}>
              [{sbtScreen[item.key] ? 'X' : ' '}] {item.label}
            </li>
          ))}
        </ul>
        {lastSbtDate && (
          <p className="text-xs text-gray-500">
            Last SBT: {lastSbtDate} — {lastSbtPassed ? 'Passed' : 'Failed'}
          </p>
        )}
      </div>

      <p className="text-xs italic text-gray-500">{CITATION}</p>
    </div>
  )
}
