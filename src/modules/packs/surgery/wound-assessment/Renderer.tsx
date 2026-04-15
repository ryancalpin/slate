import type { FC } from 'react'
import type { WoundAssessmentData, VacSettings } from './index'

const WOUND_TYPES = ['surgical incision', 'open abdomen', 'VAC', 'dehiscence', 'skin graft', 'other']
const DEHISCENCE_OPTIONS = ['none', 'superficial', 'partial', 'complete']
const VAC_MODES = ['continuous', 'intermittent']

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange }) => {
  const d = data as WoundAssessmentData

  function update(patch: Partial<WoundAssessmentData>) {
    onDataChange({ ...d, ...patch })
  }

  function updateVac(patch: Partial<VacSettings>) {
    const current: VacSettings = d.vac ?? { mode: 'continuous', pressure: 125, dressingDate: '' }
    onDataChange({ ...d, vac: { ...current, ...patch } })
  }

  function handleTypeChange(woundType: string) {
    update({
      woundType,
      vac: woundType === 'VAC' ? (d.vac ?? { mode: 'continuous', pressure: 125, dressingDate: '' }) : null,
    })
  }

  return (
    <div className="p-3 space-y-3">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Wound Assessment</h3>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Location</label>
        <input
          className="w-full text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
          value={d.location ?? ''}
          onChange={e => update({ location: e.target.value })}
          placeholder="e.g. Right lower quadrant"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Wound Type</label>
        <select
          className="w-full text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
          value={d.woundType ?? 'surgical incision'}
          onChange={e => handleTypeChange(e.target.value)}
        >
          {WOUND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {d.woundType === 'VAC' && (
        <div className="border border-blue-200 dark:border-blue-700 rounded p-2 space-y-2 bg-blue-50 dark:bg-blue-900/20">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">VAC Settings</p>
          <div className="flex gap-3 flex-wrap">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-0.5">Mode</label>
              <select
                className="text-sm border border-gray-300 dark:border-gray-500 rounded px-1 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                value={d.vac?.mode ?? 'continuous'}
                onChange={e => updateVac({ mode: e.target.value })}
              >
                {VAC_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-0.5">Pressure (cmH₂O)</label>
              <input
                type="number"
                className="w-20 text-sm border border-gray-300 dark:border-gray-500 rounded px-1 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                value={d.vac?.pressure ?? 125}
                onChange={e => updateVac({ pressure: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-300 mb-0.5">Dressing Change Date</label>
              <input
                type="date"
                className="text-sm border border-gray-300 dark:border-gray-500 rounded px-1 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
                value={d.vac?.dressingDate ?? ''}
                onChange={e => updateVac({ dressingDate: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Dehiscence Status</label>
        <select
          className="w-full text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
          value={d.dehiscence ?? 'none'}
          onChange={e => update({ dehiscence: e.target.value })}
        >
          {DEHISCENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Description</label>
        <textarea
          className="w-full text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100 resize-y"
          rows={3}
          value={d.description ?? ''}
          onChange={e => update({ description: e.target.value })}
          placeholder="Wound appearance, drainage, surrounding tissue..."
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Assessment Date</label>
        <input
          type="date"
          className="text-sm border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-100"
          value={d.assessmentDate ?? new Date().toISOString().slice(0, 10)}
          onChange={e => update({ assessmentDate: e.target.value })}
        />
      </div>
    </div>
  )
}
