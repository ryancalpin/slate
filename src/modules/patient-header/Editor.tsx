import type { FC } from 'react'

interface Props {
  config: Record<string, unknown>
  onConfigChange: (config: Record<string, unknown>) => void
}

const FIELDS = [
  { key: 'showRoom', label: 'Room' },
  { key: 'showPatient', label: 'Patient Label' },
  { key: 'showAge', label: 'Age' },
  { key: 'showSex', label: 'Sex' },
  { key: 'showAdmitDate', label: 'Admit Date' },
  { key: 'showAttending', label: 'Attending' },
  { key: 'showService', label: 'Service' },
  { key: 'showDiagnosis', label: 'Primary Diagnosis' },
  { key: 'showCodeStatus', label: 'Code Status' },
  { key: 'showIsolation', label: 'Isolation' },
]

export const Editor: FC<Props> = ({ config, onConfigChange }) => {
  const toggle = (key: string) => {
    onConfigChange({ ...config, [key]: !(config[key] !== false) })
  }

  const customLabels = (config.customLabels as Array<{ name: string }>) ?? [{name:''},{name:''},{name:''}]

  const updateCustomLabel = (i: number, value: string) => {
    const next = [...customLabels]
    next[i] = { name: value }
    onConfigChange({ ...config, customLabels: next })
  }

  return (
    <div className="space-y-4 p-3">
      <div>
        <h3 className="text-sm font-semibold mb-2">Visible Fields</h3>
        <div className="space-y-1">
          {FIELDS.map(f => (
            <label key={f.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={config[f.key] !== false}
                onChange={() => toggle(f.key)}
                className="rounded"
              />
              {f.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-2">Custom Label Fields (up to 3)</h3>
        <div className="space-y-2">
          {[0, 1, 2].map(i => (
            <input
              key={i}
              type="text"
              placeholder={`Custom field ${i + 1} name`}
              value={customLabels[i]?.name ?? ''}
              onChange={e => updateCustomLabel(i, e.target.value)}
              className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-transparent"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
