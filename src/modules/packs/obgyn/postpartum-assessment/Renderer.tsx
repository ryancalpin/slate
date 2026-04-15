import type { FC } from 'react'

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as Record<string, unknown>
  const readOnly = mode === 'build'
  const set = (key: string, value: unknown) => onDataChange({ ...data, [key]: value })

  return (
    <div className="p-3 space-y-3 text-sm">
      <h3 className="font-semibold text-base">Postpartum Assessment</h3>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Fundal Height (cm below umbilicus)</span>
          <input
            type="number"
            className="border rounded px-2 py-1 bg-transparent"
            value={(d.fundalHeight as number) ?? ''}
            disabled={readOnly}
            onChange={e => set('fundalHeight', Number(e.target.value))}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Fundal Firmness</span>
          <select
            className="border rounded px-2 py-1 bg-transparent"
            value={(d.fundalFirmness as string) ?? 'firm'}
            disabled={readOnly}
            onChange={e => set('fundalFirmness', e.target.value)}
          >
            <option value="firm">Firm</option>
            <option value="boggy">Boggy</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Lochia Character</span>
          <select
            className="border rounded px-2 py-1 bg-transparent"
            value={(d.lochiaCharacter as string) ?? 'rubra'}
            disabled={readOnly}
            onChange={e => set('lochiaCharacter', e.target.value)}
          >
            <option value="rubra">Rubra</option>
            <option value="serosa">Serosa</option>
            <option value="alba">Alba</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Lochia Volume</span>
          <select
            className="border rounded px-2 py-1 bg-transparent"
            value={(d.lochiaVolume as string) ?? 'light'}
            disabled={readOnly}
            onChange={e => set('lochiaVolume', e.target.value)}
          >
            {['scant', 'light', 'moderate', 'heavy'].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Perineum / Incision</span>
          <select
            className="border rounded px-2 py-1 bg-transparent"
            value={(d.perineumStatus as string) ?? 'intact'}
            disabled={readOnly}
            onChange={e => set('perineumStatus', e.target.value)}
          >
            {['intact', 'ecchymosis', 'edema', 'hematoma', 'dehiscence'].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-gray-400 text-xs">Breastfeeding</span>
          <select
            className="border rounded px-2 py-1 bg-transparent"
            value={(d.breastfeeding as string) ?? 'exclusive'}
            disabled={readOnly}
            onChange={e => set('breastfeeding', e.target.value)}
          >
            <option value="exclusive">Exclusive</option>
            <option value="supplementing">Supplementing</option>
            <option value="formula only">Formula Only</option>
            <option value="not attempting">Not Attempting</option>
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-gray-400 text-xs">Mood / Affect Note</span>
        <textarea
          className="border rounded px-2 py-1 bg-transparent w-full"
          rows={2}
          value={(d.moodNote as string) ?? ''}
          disabled={readOnly}
          onChange={e => set('moodNote', e.target.value)}
        />
      </label>
    </div>
  )
}
