import type { FC } from 'react'

const RASS_CITATION = 'Sessler CN et al. Am J Respir Crit Care Med. 2002;166(10):1338-1344'
const CPOT_CITATION = 'Gélinas C et al. Am J Crit Care. 2006;15(4):420-427'

const RASS_LEVELS: { score: number; label: string }[] = [
  { score: -5, label: 'Unarousable' },
  { score: -4, label: 'Deep sedation' },
  { score: -3, label: 'Moderate sedation' },
  { score: -2, label: 'Light sedation' },
  { score: -1, label: 'Drowsy' },
  { score: 0, label: 'Alert & calm' },
  { score: 1, label: 'Restless' },
  { score: 2, label: 'Agitated' },
  { score: 3, label: 'Very agitated' },
  { score: 4, label: 'Combative' },
]

export function calcCPOT(face: number, body: number, muscle: number, compliance: number): number {
  return face + body + muscle + compliance
}

interface SedationData {
  rass: number
  cpotFace: number
  cpotBody: number
  cpotMuscle: number
  cpotCompliance: number
  goalRassMin: number
  goalRassMax: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const SubscaleInput: FC<{
  label: string
  value: number
  onChange: (v: number) => void
  disabled: boolean
}> = ({ label, value, onChange, disabled }) => (
  <div className="flex items-center justify-between py-1 border-b border-gray-700 last:border-0">
    <span className="text-xs text-gray-300">{label}</span>
    <div className="flex gap-1">
      {[0, 1, 2].map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          disabled={disabled}
          className={`w-7 h-7 rounded text-xs font-semibold transition-colors ${
            value === v
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          } disabled:cursor-not-allowed`}
        >
          {v}
        </button>
      ))}
    </div>
  </div>
)

export const SedationRenderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as unknown as SedationData
  const rass = d.rass ?? 0
  const goalMin = d.goalRassMin ?? -2
  const goalMax = d.goalRassMax ?? 0
  const inGoal = rass >= goalMin && rass <= goalMax

  const cpotTotal = calcCPOT(d.cpotFace ?? 0, d.cpotBody ?? 0, d.cpotMuscle ?? 0, d.cpotCompliance ?? 0)


  const update = (fields: Partial<SedationData>) => onDataChange({ ...d, ...fields })

  return (
    <div className="p-3 space-y-4">
      {/* RASS Section */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm text-gray-200">RASS Score</h3>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${
              inGoal ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'
            }`}
          >
            {inGoal ? 'IN GOAL' : 'OUT OF GOAL'}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <select
            id="rass-select"
            aria-label="RASS Score"
            value={rass}
            onChange={(e) => update({ rass: parseInt(e.target.value) })}
            disabled={mode === 'build'}
            className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm"
          >
            {RASS_LEVELS.map((r) => (
              <option key={r.score} value={r.score}>
                {r.score > 0 ? `+${r.score}` : r.score} — {r.label}
              </option>
            ))}
          </select>
        </div>

        <p className="text-xs text-gray-500">
          Goal: {goalMin} to {goalMax >= 0 ? `+${goalMax}` : goalMax}
        </p>
        <p className="text-xs italic text-gray-400 mt-1">{RASS_CITATION}</p>
      </div>

      {/* CPOT Section */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm text-gray-200">CPOT Score</h3>
          <span className="text-sm font-bold text-gray-200">{cpotTotal} / 8</span>
        </div>
        <div className="space-y-0">
          <SubscaleInput
            label="Facial Expression (0-2)"
            value={d.cpotFace ?? 0}
            onChange={(v) => update({ cpotFace: v })}
            disabled={mode === 'build'}
          />
          <SubscaleInput
            label="Body Movements (0-2)"
            value={d.cpotBody ?? 0}
            onChange={(v) => update({ cpotBody: v })}
            disabled={mode === 'build'}
          />
          <SubscaleInput
            label="Muscle Tension (0-2)"
            value={d.cpotMuscle ?? 0}
            onChange={(v) => update({ cpotMuscle: v })}
            disabled={mode === 'build'}
          />
          <SubscaleInput
            label="Compliance with Vent / Vocalization (0-2)"
            value={d.cpotCompliance ?? 0}
            onChange={(v) => update({ cpotCompliance: v })}
            disabled={mode === 'build'}
          />
        </div>
        <p className="text-xs italic text-gray-400 mt-1">{CPOT_CITATION}</p>
      </div>
    </div>
  )
}
