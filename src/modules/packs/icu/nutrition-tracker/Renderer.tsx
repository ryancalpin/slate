import React, { FC } from 'react'

export function calcPctGoal(current: number, goal: number): number {
  if (goal === 0) return 0
  return Math.min(100, Math.round((current / goal) * 100))
}

interface NutritionData {
  mode: 'EN' | 'PN'
  weightKg: number
  kcalGoalPerKg: number
  proteinGoalPerKg: number
  kcalCurrentPerDay: number
  proteinCurrentPerDay: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const ProgressBar: FC<{ pct: number; color: string }> = ({ pct, color }) => (
  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
    <div
      className={`h-2 rounded-full transition-all ${color}`}
      style={{ width: `${Math.min(100, pct)}%` }}
    />
  </div>
)

export const NutritionRenderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as NutritionData
  const feedMode = d.mode ?? 'EN'
  const weight = d.weightKg ?? 70
  const kcalPerKg = d.kcalGoalPerKg ?? 25
  const proteinPerKg = d.proteinGoalPerKg ?? 1.2
  const kcalCurrent = d.kcalCurrentPerDay ?? 0
  const proteinCurrent = d.proteinCurrentPerDay ?? 0

  const kcalGoal = Math.round(weight * kcalPerKg)
  const proteinGoal = Math.round(weight * proteinPerKg * 10) / 10
  const kcalPct = calcPctGoal(kcalCurrent, kcalGoal)
  const proteinPct = calcPctGoal(proteinCurrent, proteinGoal)

  const update = (fields: Partial<NutritionData>) => onDataChange({ ...d, ...fields })

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-200">Nutrition Tracker</h3>
        <div className="flex rounded overflow-hidden border border-gray-600">
          {(['EN', 'PN'] as const).map((m) => (
            <button
              key={m}
              onClick={() => update({ mode: m })}
              disabled={mode === 'build'}
              className={`px-3 py-1 text-xs font-semibold transition-colors ${
                feedMode === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              } disabled:cursor-not-allowed`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1" htmlFor="weight-input">
            Weight (kg)
          </label>
          <input
            id="weight-input"
            type="number"
            value={weight}
            min={1}
            max={300}
            onChange={(e) => update({ weightKg: parseFloat(e.target.value) || 0 })}
            disabled={mode === 'build'}
            className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Feed Type</label>
          <span className="text-sm text-gray-300 font-semibold">{feedMode === 'EN' ? 'Enteral' : 'Parenteral'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1" htmlFor="kcal-goal-input">
            kcal goal (kcal/kg/d)
          </label>
          <input
            id="kcal-goal-input"
            type="number"
            value={kcalPerKg}
            min={10}
            max={50}
            step={1}
            onChange={(e) => update({ kcalGoalPerKg: parseFloat(e.target.value) || 25 })}
            disabled={mode === 'build'}
            className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1" htmlFor="protein-goal-input">
            Protein goal (g/kg/d)
          </label>
          <input
            id="protein-goal-input"
            type="number"
            value={proteinPerKg}
            min={0.5}
            max={3.0}
            step={0.1}
            onChange={(e) => update({ proteinGoalPerKg: parseFloat(e.target.value) || 1.2 })}
            disabled={mode === 'build'}
            className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm w-full"
          />
        </div>
      </div>

      {/* Kcal row */}
      <div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-gray-400">Kcal</span>
          <span className="text-xs font-bold text-blue-300">{kcalPct}%</span>
        </div>
        <p className="text-xs text-gray-500">{kcalCurrent} / {kcalGoal} kcal/day</p>
        <ProgressBar pct={kcalPct} color={kcalPct >= 80 ? 'bg-green-500' : 'bg-blue-500'} />
        <input
          type="number"
          value={kcalCurrent}
          min={0}
          onChange={(e) => update({ kcalCurrentPerDay: parseFloat(e.target.value) || 0 })}
          disabled={mode === 'build'}
          placeholder="Current kcal/day"
          className="mt-1 bg-gray-800 text-gray-100 rounded px-2 py-1 text-xs w-full"
        />
      </div>

      {/* Protein row */}
      <div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-gray-400">Protein</span>
          <span className="text-xs text-gray-300">{proteinCurrent} / {proteinGoal} g/day ({proteinPct} pct of goal)</span>
        </div>
        <ProgressBar pct={proteinPct} color={proteinPct >= 80 ? 'bg-green-500' : 'bg-purple-500'} />
        <input
          type="number"
          value={proteinCurrent}
          min={0}
          onChange={(e) => update({ proteinCurrentPerDay: parseFloat(e.target.value) || 0 })}
          disabled={mode === 'build'}
          placeholder="Current protein g/day"
          className="mt-1 bg-gray-800 text-gray-100 rounded px-2 py-1 text-xs w-full"
        />
      </div>
    </div>
  )
}
