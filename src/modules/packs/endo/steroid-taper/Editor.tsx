interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

export function SteroidTaperEditor({ config, onConfigChange }: Props) {
  return (
    <div className="p-3 space-y-3 text-sm">
      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-700 w-24">Default Unit</label>
        <select
          className="border rounded px-2 py-1"
          value={(config.defaultUnit as string) ?? 'mg'}
          onChange={(e) => onConfigChange({ ...config, defaultUnit: e.target.value })}
        >
          <option value="mg">mg</option>
          <option value="mcg">mcg</option>
          <option value="mg/kg">mg/kg</option>
        </select>
      </div>
    </div>
  )
}

export default SteroidTaperEditor
