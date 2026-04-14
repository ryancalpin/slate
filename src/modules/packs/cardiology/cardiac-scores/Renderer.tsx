import type { FC } from 'react'
import { TIMI_ITEMS, GRACE_COMPONENTS, calcTIMI, interpretGRACE, timiRisk } from './index'

const CITATION_TIMI = 'Antman EM et al. JAMA. 2000;284(7):835-842'
const CITATION_GRACE = 'Fox KA et al. Eur Heart J. 2006;27(24):2944-2947'

type CardiacData = {
  timiItems: boolean[]
  graceScore: number
  graceComponents: Record<string, number>
}

const DEFAULT_DATA: CardiacData = {
  timiItems: Array(7).fill(false),
  graceScore: 0,
  graceComponents: {},
}

const GRACE_RISK_COLOR: Record<string, string> = {
  low: 'text-green-400',
  intermediate: 'text-yellow-400',
  high: 'text-red-400',
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const title = (config.title as string) ?? 'Cardiac Risk Scores'
  const d: CardiacData = {
    ...DEFAULT_DATA,
    ...(data as Partial<CardiacData>),
    timiItems: (data as Partial<CardiacData>).timiItems ?? Array(7).fill(false),
  }
  const readOnly = mode === 'build'

  const timiScore = calcTIMI(d.timiItems)
  const timiRiskPct = timiRisk(timiScore)

  const graceRisk = d.graceScore > 0 ? interpretGRACE(d.graceScore) : null
  const graceColor = graceRisk !== null ? GRACE_RISK_COLOR[graceRisk] : ''

  const componentTotal = Object.values(d.graceComponents).reduce((sum, v) => sum + (v || 0), 0)

  function toggleTimi(i: number, checked: boolean) {
    const next = [...d.timiItems]
    next[i] = checked
    onDataChange({ ...d, timiItems: next })
  }

  function updateGraceComponent(label: string, value: number) {
    const nextComponents = { ...d.graceComponents, [label]: value }
    const nextTotal = Object.values(nextComponents).reduce((s, v) => s + (v || 0), 0)
    onDataChange({ ...d, graceComponents: nextComponents, graceScore: nextTotal })
  }

  function updateGraceScore(value: number) {
    onDataChange({ ...d, graceScore: value })
  }

  return (
    <div className="p-3 h-full flex flex-col gap-3 text-sm overflow-y-auto">
      <h3 className="font-semibold text-base">{title}</h3>

      {/* TIMI */}
      <div className="border border-gray-700 rounded p-2">
        <p className="text-xs font-semibold text-gray-300 mb-1">UA/NSTEMI Risk</p>
        <div className="flex flex-col gap-0.5">
          {TIMI_ITEMS.map((item, i) => (
            <label key={i} className="flex items-start gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded mt-0.5 flex-shrink-0"
                checked={!!d.timiItems[i]}
                disabled={readOnly}
                onChange={e => toggleTimi(i, e.target.checked)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>
        <div className="mt-2">
          <span className="text-sm font-bold">TIMI Score: {timiScore} — 30-day event risk: {timiRiskPct}</span>
        </div>
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_TIMI}</p>
      </div>

      {/* GRACE */}
      <div className="border border-gray-700 rounded p-2">
        <p className="text-xs font-semibold text-gray-300 mb-1">GRACE Score — ACS Risk</p>

        <div className="mb-2">
          <p className="text-xs text-gray-400 mb-1">Simplified point calculator (enter component points from nomogram):</p>
          <div className="grid grid-cols-2 gap-1">
            {GRACE_COMPONENTS.map(comp => (
              <div key={comp} className="flex items-center gap-1 text-xs">
                <span className="flex-1 text-gray-300 truncate">{comp.replace(' (points)', '')}</span>
                <input
                  type="number"
                  min={0}
                  className="bg-transparent border-b border-gray-600 w-10 focus:outline-none focus:border-blue-400 text-right"
                  value={d.graceComponents[comp] ?? ''}
                  readOnly={readOnly}
                  onChange={e => updateGraceComponent(comp, parseInt(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
          {componentTotal > 0 ? (
            <p className="text-xs text-gray-500 mt-1">Component sum: {componentTotal}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">Total score:</label>
          <input
            type="number"
            min={0}
            className="bg-transparent border-b border-gray-600 w-16 font-bold focus:outline-none focus:border-blue-400"
            value={d.graceScore || ''}
            readOnly={readOnly}
            onChange={e => updateGraceScore(parseInt(e.target.value) || 0)}
          />
        </div>

        {graceRisk !== null ? (
          <div className="mt-1 flex items-center gap-2">
            <span className={`text-xs font-bold uppercase ${graceColor}`}>
              {graceRisk} risk
            </span>
            <span className="text-xs text-gray-500">
              {'(<108=low | 108-140=intermediate | >140=high)'}
            </span>
          </div>
        ) : null}
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_GRACE}</p>
      </div>
    </div>
  )
}

export default Renderer
