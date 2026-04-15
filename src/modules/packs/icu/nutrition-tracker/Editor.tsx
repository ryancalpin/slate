import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const NutritionEditor: FC<Props> = ({ config, onConfigChange }) => {
  const defaultKcalPerKg = (config.defaultKcalPerKg as number) ?? 25
  const defaultProteinPerKg = (config.defaultProteinPerKg as number) ?? 1.2

  return (
    <div className="p-3 space-y-3">
      <h4 className="text-sm font-semibold text-gray-200">Nutrition Tracker Settings</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Default kcal/kg/d</label>
          <input
            type="number"
            value={defaultKcalPerKg}
            min={10}
            max={50}
            step={1}
            onChange={(e) =>
              onConfigChange({ ...config, defaultKcalPerKg: parseFloat(e.target.value) || 25 })
            }
            className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Default protein g/kg/d</label>
          <input
            type="number"
            value={defaultProteinPerKg}
            min={0.5}
            max={3.0}
            step={0.1}
            onChange={(e) =>
              onConfigChange({ ...config, defaultProteinPerKg: parseFloat(e.target.value) || 1.2 })
            }
            className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm w-full"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Typical ICU targets: 25–30 kcal/kg/d, 1.2–2.0 g protein/kg/d.
      </p>
    </div>
  )
}
