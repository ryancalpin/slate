import React from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export function GlucoseLogEditor({ config, onConfigChange }: Props) {
  return (
    <div className="p-3 space-y-3 text-sm">
      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-700 w-32">Target Low (mg/dL)</label>
        <input
          type="number"
          className="border rounded px-2 py-1 w-24"
          value={(config.targetLow as number) ?? 70}
          onChange={(e) => onConfigChange({ ...config, targetLow: Number(e.target.value) })}
          min={40}
          max={400}
        />
      </div>
      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-700 w-32">Target High (mg/dL)</label>
        <input
          type="number"
          className="border rounded px-2 py-1 w-24"
          value={(config.targetHigh as number) ?? 180}
          onChange={(e) => onConfigChange({ ...config, targetHigh: Number(e.target.value) })}
          min={40}
          max={400}
        />
      </div>
    </div>
  )
}

export default GlucoseLogEditor
