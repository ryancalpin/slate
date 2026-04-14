import React, { FC } from 'react'
import { calcPctGoal } from './Renderer'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const NutritionPrintView: FC<Props> = ({ data }) => {
  const mode = (data.mode as string) ?? 'EN'
  const weight = (data.weightKg as number) ?? 0
  const kcalPerKg = (data.kcalGoalPerKg as number) ?? 25
  const proteinPerKg = (data.proteinGoalPerKg as number) ?? 1.2
  const kcalCurrent = (data.kcalCurrentPerDay as number) ?? 0
  const proteinCurrent = (data.proteinCurrentPerDay as number) ?? 0
  const kcalGoal = Math.round(weight * kcalPerKg)
  const proteinGoal = Math.round(weight * proteinPerKg * 10) / 10
  const kcalPct = calcPctGoal(kcalCurrent, kcalGoal)
  const proteinPct = calcPctGoal(proteinCurrent, proteinGoal)

  return (
    <div className="font-mono text-sm space-y-2">
      <h3 className="font-bold text-base">Nutrition Tracker</h3>
      <p>Mode: <strong>{mode}</strong> | Weight: {weight} kg</p>
      <table className="w-full border border-gray-300 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1 text-left">Metric</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Goal/kg</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Total Goal</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Current</th>
            <th className="border border-gray-300 px-2 py-1 text-left">% Goal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 px-2 py-1">Kcal</td>
            <td className="border border-gray-300 px-2 py-1">{kcalPerKg} kcal/kg</td>
            <td className="border border-gray-300 px-2 py-1">{kcalGoal} kcal/d</td>
            <td className="border border-gray-300 px-2 py-1">{kcalCurrent} kcal/d</td>
            <td className="border border-gray-300 px-2 py-1">{kcalPct}%</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-2 py-1">Protein</td>
            <td className="border border-gray-300 px-2 py-1">{proteinPerKg} g/kg</td>
            <td className="border border-gray-300 px-2 py-1">{proteinGoal} g/d</td>
            <td className="border border-gray-300 px-2 py-1">{proteinCurrent} g/d</td>
            <td className="border border-gray-300 px-2 py-1">{proteinPct}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
