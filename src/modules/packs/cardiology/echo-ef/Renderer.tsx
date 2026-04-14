import type { FC } from 'react'
import { classifyEF } from './index'

const CITATION = '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. JACC. 2022;79(17):e263-e421'

type EchoData = { ef: number; echoDate: string; lvedd: number; lvesd: number; wallMotion: string; valvular: string }
const DEFAULT_DATA: EchoData = { ef: 0, echoDate: '', lvedd: 0, lvesd: 0, wallMotion: '', valvular: '' }

function classColor(cls: string): string {
  if (cls === 'HFrEF') return 'bg-red-900 text-red-200'
  if (cls === 'HFmrEF') return 'bg-yellow-900 text-yellow-200'
  return 'bg-green-900 text-green-200'
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const title = (config.title as string) ?? 'Echo / EF Summary'
  const d: EchoData = { ...DEFAULT_DATA, ...(data as Partial<EchoData>) }
  const cls = d.ef > 0 ? classifyEF(d.ef) : null
  const readOnly = mode === 'build'

  function update(field: keyof EchoData, value: string | number) {
    onDataChange({ ...d, [field]: value })
  }

  return (
    <div className="p-3 h-full flex flex-col gap-2 text-sm">
      <h3 className="font-semibold text-base">{title}</h3>

      <div className="flex items-end gap-3">
        <div>
          <label className="block text-xs text-gray-400">EF (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            className="bg-transparent border-b border-gray-600 w-16 focus:outline-none focus:border-blue-400 text-lg font-bold"
            value={d.ef || ''}
            readOnly={readOnly}
            onChange={e => update('ef', parseFloat(e.target.value) || 0)}
          />
        </div>
        {cls !== null ? (
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${classColor(cls)}`}>{cls}</span>
        ) : null}
        <div className="ml-auto">
          <label className="block text-xs text-gray-400">Echo Date</label>
          <input
            type="date"
            className="bg-transparent border-b border-gray-600 focus:outline-none focus:border-blue-400 text-xs"
            value={d.echoDate}
            readOnly={readOnly}
            onChange={e => update('echoDate', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400">LVEDD (mm)</label>
          <input
            type="number"
            className="bg-transparent border-b border-gray-600 w-full focus:outline-none focus:border-blue-400"
            value={d.lvedd || ''}
            readOnly={readOnly}
            onChange={e => update('lvedd', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400">LVESD (mm)</label>
          <input
            type="number"
            className="bg-transparent border-b border-gray-600 w-full focus:outline-none focus:border-blue-400"
            value={d.lvesd || ''}
            readOnly={readOnly}
            onChange={e => update('lvesd', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400">Wall Motion Abnormalities</label>
        <input
          className="bg-transparent border-b border-gray-600 w-full focus:outline-none focus:border-blue-400"
          value={d.wallMotion}
          readOnly={readOnly}
          onChange={e => update('wallMotion', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400">Valvular Findings</label>
        <input
          className="bg-transparent border-b border-gray-600 w-full focus:outline-none focus:border-blue-400"
          value={d.valvular}
          readOnly={readOnly}
          onChange={e => update('valvular', e.target.value)}
        />
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}

export default Renderer
