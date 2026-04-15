import type { FC } from 'react'

const CITATION = 'Girard TD et al. Lancet. 2008;371(9607):126-134'

const SAT_ITEMS: { key: string; label: string }[] = [
  { key: 'noAgitation', label: 'No agitation (RASS ≤ -3 overnight or no recent episodes)' },
  { key: 'noSeizures', label: 'No active seizures' },
  { key: 'noWithdrawal', label: 'No alcohol/benzo withdrawal' },
  { key: 'noParalytic', label: 'No active paralytic infusion' },
  { key: 'noElevatedICP', label: 'No elevated ICP' },
  { key: 'noHighFiO2', label: 'No FiO₂ > 50% or PEEP > 8 (NMD patients)' },
]

const SBT_ITEMS: { key: string; label: string }[] = [
  { key: 'fio2Ok', label: 'FiO₂ ≤ 50%' },
  { key: 'peepOk', label: 'PEEP ≤ 8 cmH₂O' },
  { key: 'noVasopressors', label: 'No vasopressors (or minimal low-dose)' },
  { key: 'passedSat', label: 'Passed SAT' },
  { key: 'coughOk', label: 'Adequate cough / secretions manageable' },
]

interface SatSbtData {
  satScreen: Record<string, boolean>
  sbtScreen: Record<string, boolean>
  lastSatDate: string
  lastSbtDate: string
  lastSbtPassed: boolean
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const SatSbtRenderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as unknown as SatSbtData
  const satScreen = d.satScreen ?? {}
  const sbtScreen = d.sbtScreen ?? {}

  const satPassed = SAT_ITEMS.every((item) => satScreen[item.key] === true)
  const sbtPassed = SBT_ITEMS.every((item) => sbtScreen[item.key] === true)

  const toggleSat = (key: string, checked: boolean) => {
    onDataChange({ ...d, satScreen: { ...satScreen, [key]: checked } })
  }

  const toggleSbt = (key: string, checked: boolean) => {
    onDataChange({ ...d, sbtScreen: { ...sbtScreen, [key]: checked } })
  }

  const PassBadge = ({ passed, label }: { passed: boolean; label: string }) => (
    <span
      className={`text-xs font-bold px-2 py-0.5 rounded ${
        passed ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'
      }`}
    >
      {passed ? `${label} PASS` : `${label} FAIL`}
    </span>
  )

  return (
    <div className="p-3 space-y-4">
      {/* SAT Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-gray-200">SAT Safety Screen</h3>
          <PassBadge passed={satPassed} label="SAT" />
        </div>
        <div className="space-y-1.5">
          {SAT_ITEMS.map((item) => (
            <label key={item.key} className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={satScreen[item.key] === true}
                onChange={(e) => toggleSat(item.key, e.target.checked)}
                disabled={mode === 'build'}
                className="mt-0.5 accent-blue-500"
              />
              <span className="text-xs text-gray-300">{item.label}</span>
            </label>
          ))}
        </div>
        {d.lastSatDate && (
          <p className="text-xs text-gray-500 mt-1">Last SAT: {d.lastSatDate}</p>
        )}
      </div>

      {/* SBT Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-gray-200">SBT Safety Screen</h3>
          <PassBadge passed={sbtPassed} label="SBT" />
        </div>
        <div className="space-y-1.5">
          {SBT_ITEMS.map((item) => (
            <label key={item.key} className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sbtScreen[item.key] === true}
                onChange={(e) => toggleSbt(item.key, e.target.checked)}
                disabled={mode === 'build'}
                className="mt-0.5 accent-blue-500"
              />
              <span className="text-xs text-gray-300">{item.label}</span>
            </label>
          ))}
        </div>
        {d.lastSbtDate && (
          <p className="text-xs text-gray-500 mt-1">
            Last SBT: {d.lastSbtDate} —{' '}
            <span className={d.lastSbtPassed ? 'text-green-400' : 'text-red-400'}>
              {d.lastSbtPassed ? 'Passed' : 'Failed'}
            </span>
          </p>
        )}
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
