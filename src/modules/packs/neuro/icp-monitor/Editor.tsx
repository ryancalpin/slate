import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export const Editor: FC<Props> = ({ config, onConfigChange }) => {
  const cppTarget = (config.cppTarget as number) ?? 60

  return (
    <div className="p-3 space-y-3 text-sm text-gray-200">
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          CPP Target Threshold (mmHg)
        </label>
        <input
          type="number"
          value={cppTarget}
          min={40}
          max={100}
          onChange={(e) =>
            onConfigChange({ ...config, cppTarget: Number(e.target.value) })
          }
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
        />
        <p className="text-xs text-gray-500 mt-0.5">
          Alert shown when CPP falls below this value (BTF guideline: 60–70 mmHg)
        </p>
      </div>
    </div>
  )
}
