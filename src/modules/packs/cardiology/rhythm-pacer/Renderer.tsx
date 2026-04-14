import type { FC } from 'react'
import { RHYTHM_OPTIONS, CHADS_ITEMS, HASBLED_ITEMS, calcCHADS2VASc, calcHASBLED } from './index'

const CITATION_CHADS = 'Lip GY et al. Chest. 2010;137(2):263-272'
const CITATION_HASBLED = 'Pisters R et al. Chest. 2010;138(5):1093-1100'

type PacerSettings = { mode: string; rate: number; output: number; sensitivity: number }
type RhythmData = { rhythm: string; pacer?: PacerSettings; chadsItems: Record<string, boolean>; hasbledItems: Record<string, boolean> }

const DEFAULT_DATA: RhythmData = { rhythm: 'NSR', chadsItems: {}, hasbledItems: {} }
const DEFAULT_PACER: PacerSettings = { mode: 'DDD', rate: 60, output: 2, sensitivity: 2 }

function showPacer(rhythm: string): boolean {
  return rhythm === 'Paced' || rhythm.includes('AV Block')
}

function chadsRisk(score: number): { label: string; color: string } {
  if (score === 0) return { label: 'Low risk', color: 'text-green-400' }
  if (score === 1) return { label: 'Intermediate', color: 'text-yellow-400' }
  return { label: 'High risk (anticoag recommended)', color: 'text-red-400' }
}

function hasbledRisk(score: number): { label: string; color: string } {
  if (score < 3) return { label: 'Low bleeding risk', color: 'text-green-400' }
  return { label: 'High bleeding risk ≥ 3', color: 'text-red-400' }
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const title = (config.title as string) ?? 'Rhythm & Pacemaker'
  const d: RhythmData = { ...DEFAULT_DATA, ...(data as Partial<RhythmData>) }
  const readOnly = mode === 'build'
  const showPacerFields = showPacer(d.rhythm)
  const pacer = d.pacer ?? DEFAULT_PACER
  const chadsScore = calcCHADS2VASc(d.chadsItems)
  const hasbledScore = calcHASBLED(d.hasbledItems)

  function update(field: keyof RhythmData, value: unknown) {
    onDataChange({ ...d, [field]: value })
  }

  function updatePacer(field: keyof PacerSettings, value: string | number) {
    onDataChange({ ...d, pacer: { ...pacer, [field]: value } })
  }

  function toggleChads(key: string, checked: boolean) {
    onDataChange({ ...d, chadsItems: { ...d.chadsItems, [key]: checked } })
  }

  function toggleHasbled(key: string, checked: boolean) {
    onDataChange({ ...d, hasbledItems: { ...d.hasbledItems, [key]: checked } })
  }

  const chadsInfo = chadsRisk(chadsScore)
  const hasbledInfo = hasbledRisk(hasbledScore)

  return (
    <div className="p-3 h-full flex flex-col gap-3 text-sm overflow-y-auto">
      <h3 className="font-semibold text-base">{title}</h3>

      {/* Rhythm */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Rhythm</label>
        <select
          className="bg-gray-800 border border-gray-600 rounded px-2 py-1 focus:outline-none focus:border-blue-400 w-full"
          value={d.rhythm}
          disabled={readOnly}
          onChange={e => update('rhythm', e.target.value)}
        >
          {RHYTHM_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Pacemaker settings */}
      {showPacerFields ? (
        <div className="border border-gray-700 rounded p-2">
          <p className="text-xs font-semibold text-gray-300 mb-2">Pacemaker Settings</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-gray-400">Mode</label>
              <select
                className="bg-gray-800 border border-gray-600 rounded px-1 py-0.5 w-full focus:outline-none focus:border-blue-400"
                value={pacer.mode}
                disabled={readOnly}
                onChange={e => updatePacer('mode', e.target.value)}
              >
                {['AAI', 'VVI', 'DDD', 'VOO'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-400">Rate (bpm)</label>
              <input type="number" className="bg-transparent border-b border-gray-600 w-full focus:outline-none focus:border-blue-400"
                value={pacer.rate} readOnly={readOnly} onChange={e => updatePacer('rate', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <label className="block text-gray-400">Output (mA)</label>
              <input type="number" step="0.1" className="bg-transparent border-b border-gray-600 w-full focus:outline-none focus:border-blue-400"
                value={pacer.output} readOnly={readOnly} onChange={e => updatePacer('output', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label className="block text-gray-400">Sensitivity (mV)</label>
              <input type="number" step="0.1" className="bg-transparent border-b border-gray-600 w-full focus:outline-none focus:border-blue-400"
                value={pacer.sensitivity} readOnly={readOnly} onChange={e => updatePacer('sensitivity', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
        </div>
      ) : null}

      {/* CHADS2-VASc */}
      <div className="border border-gray-700 rounded p-2">
        <p className="text-xs font-semibold text-gray-300 mb-1">CHADS₂-VASc Score</p>
        <div className="grid grid-cols-1 gap-0.5">
          {CHADS_ITEMS.map(item => (
            <label key={item.key} className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" className="h-3.5 w-3.5 rounded"
                checked={!!d.chadsItems[item.key]}
                disabled={readOnly}
                onChange={e => toggleChads(item.key, e.target.checked)} />
              <span>{item.label}</span>
              <span className="ml-auto text-gray-500">+{item.points}</span>
            </label>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-bold">Score: {chadsScore}</span>
          <span className={`text-xs ${chadsInfo.color}`}>{chadsInfo.label}</span>
        </div>
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_CHADS}</p>
      </div>

      {/* HAS-BLED */}
      <div className="border border-gray-700 rounded p-2">
        <p className="text-xs font-semibold text-gray-300 mb-1">HAS-BLED Score</p>
        <div className="grid grid-cols-1 gap-0.5">
          {HASBLED_ITEMS.map(item => (
            <label key={item.key} className="flex items-center gap-2 text-xs cursor-pointer">
              <input type="checkbox" className="h-3.5 w-3.5 rounded"
                checked={!!d.hasbledItems[item.key]}
                disabled={readOnly}
                onChange={e => toggleHasbled(item.key, e.target.checked)} />
              <span>{item.label}</span>
              <span className="ml-auto text-gray-500">+{item.points}</span>
            </label>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-bold">Score: {hasbledScore}</span>
          <span className={`text-xs ${hasbledInfo.color}`}>{hasbledInfo.label}</span>
        </div>
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_HASBLED}</p>
      </div>
    </div>
  )
}

export default Renderer
