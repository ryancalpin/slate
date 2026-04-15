const CITATION = 'Sepsis-3 Consensus: Singer M et al. JAMA 2016;315(8):801-810'

interface SepsisData {
  rrHigh: boolean
  ams: boolean
  sbpLow: boolean
  suspectedInfection: boolean
  sofaDelta: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export function calcQSOFA(rrHigh: boolean, ams: boolean, sbpLow: boolean): number {
  return (rrHigh ? 1 : 0) + (ams ? 1 : 0) + (sbpLow ? 1 : 0)
}

export function SepsisRenderer({ data, onDataChange }: Props) {
  const typed = data as unknown as SepsisData
  const rrHigh = typed.rrHigh ?? false
  const ams = typed.ams ?? false
  const sbpLow = typed.sbpLow ?? false
  const suspectedInfection = typed.suspectedInfection ?? false
  const sofaDelta = typed.sofaDelta ?? 0

  const score = calcQSOFA(rrHigh, ams, sbpLow)

  function update(patch: Partial<SepsisData>) {
    onDataChange({ rrHigh, ams, sbpLow, suspectedInfection, sofaDelta, ...patch })
  }

  return (
    <div className="p-3 text-sm space-y-3">
      {/* qSOFA Section */}
      <div>
        <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">qSOFA Criteria</p>
        <label className="flex items-center gap-2 mb-1">
          <input
            type="checkbox"
            checked={rrHigh}
            onChange={e => update({ rrHigh: e.target.checked })}
          />
          <span>RR ≥ 22 breaths/min</span>
        </label>
        <label className="flex items-center gap-2 mb-1">
          <input
            type="checkbox"
            checked={ams}
            onChange={e => update({ ams: e.target.checked })}
          />
          <span>Altered mental status (GCS &lt; 15)</span>
        </label>
        <label className="flex items-center gap-2 mb-1">
          <input
            type="checkbox"
            checked={sbpLow}
            onChange={e => update({ sbpLow: e.target.checked })}
          />
          <span>SBP ≤ 100 mmHg</span>
        </label>
        <p className="mt-2 font-bold text-base text-gray-800 dark:text-gray-100">
          qSOFA Score: {score}
        </p>
        {score >= 2 && (
          <p className="mt-1 px-2 py-1 bg-red-100 text-red-800 rounded font-semibold text-xs">
            qSOFA ≥2: Consider sepsis workup
          </p>
        )}
      </div>

      {/* Sepsis-3 Criteria */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
        <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Sepsis-3 Criteria</p>
        <label className="flex items-center gap-2 mb-1">
          <input
            type="checkbox"
            checked={suspectedInfection}
            onChange={e => update({ suspectedInfection: e.target.checked })}
          />
          <span>Suspected infection</span>
        </label>
        <div className="flex items-center gap-2">
          <label className="text-gray-600 dark:text-gray-300">SOFA delta ≥2:</label>
          <input
            type="number"
            min={0}
            step={1}
            className="w-16 border border-gray-300 rounded px-1"
            value={sofaDelta}
            onChange={e => update({ sofaDelta: Number(e.target.value) })}
          />
        </div>
        {suspectedInfection && sofaDelta >= 2 && (
          <p className="mt-1 px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
            Meets Sepsis-3 definition: Suspected infection + SOFA delta ≥2
          </p>
        )}
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
