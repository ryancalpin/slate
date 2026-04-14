import type { FC } from 'react'
import { calcPercentTarget } from './index'

const CITATION = '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure. JACC. 2022;79(17):e263-e421'

type DrugRow = {
  drug: string
  currentDose: number
  targetDose: number
  unit: string
  active: boolean
}

type GdmtData = {
  betaBlocker: DrugRow
  aceArb: DrugRow
  mra: DrugRow
  sglt2i: DrugRow
}

const ROW_LABELS: Record<keyof GdmtData, string> = {
  betaBlocker: 'Beta-blocker',
  aceArb: 'ACEi/ARB/ARNI',
  mra: 'MRA',
  sglt2i: 'SGLT2i',
}

const DEFAULT_ROW: DrugRow = { drug: '', currentDose: 0, targetDose: 0, unit: 'mg/day', active: true }

const DEFAULT_DATA: GdmtData = {
  betaBlocker: { ...DEFAULT_ROW, unit: 'mg BID' },
  aceArb:      { ...DEFAULT_ROW },
  mra:         { ...DEFAULT_ROW },
  sglt2i:      { ...DEFAULT_ROW },
}

function pct(row: DrugRow): number {
  return calcPercentTarget(row.currentDose, row.targetDose)
}

function pctColor(p: number): string {
  if (p >= 100) return 'text-green-400'
  if (p >= 50)  return 'text-yellow-400'
  return 'text-red-400'
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const Renderer: FC<Props> = ({ config, data, onDataChange, mode }) => {
  const title = (config.title as string) ?? 'GDMT Tracker'
  const d: GdmtData = { ...DEFAULT_DATA, ...(data as Partial<GdmtData>) }

  function updateRow(key: keyof GdmtData, field: keyof DrugRow, value: string | number | boolean) {
    onDataChange({
      ...d,
      [key]: { ...d[key], [field]: value },
    })
  }

  const rows = Object.entries(ROW_LABELS) as [keyof GdmtData, string][]
  const readOnly = mode === 'build'

  return (
    <div className="p-3 h-full flex flex-col gap-2 text-sm">
      <h3 className="font-semibold text-base">{title}</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="pb-1 pr-2">Class</th>
              <th className="pb-1 pr-2">Drug</th>
              <th className="pb-1 pr-2">Current</th>
              <th className="pb-1 pr-2">Target</th>
              <th className="pb-1 pr-2">Unit</th>
              <th className="pb-1 pr-2">% Target</th>
              <th className="pb-1">On</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([key, label]) => {
              const row = d[key]
              const p = pct(row)
              return (
                <tr key={key} className="border-b border-gray-800">
                  <td className="py-1 pr-2 font-medium whitespace-nowrap">{label}</td>
                  <td className="py-1 pr-2">
                    <input
                      className="bg-transparent border-b border-gray-600 w-28 focus:outline-none focus:border-blue-400"
                      value={row.drug}
                      readOnly={readOnly}
                      onChange={e => updateRow(key, 'drug', e.target.value)}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="number"
                      className="bg-transparent border-b border-gray-600 w-16 focus:outline-none focus:border-blue-400"
                      value={row.currentDose}
                      readOnly={readOnly}
                      onChange={e => updateRow(key, 'currentDose', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      type="number"
                      className="bg-transparent border-b border-gray-600 w-16 focus:outline-none focus:border-blue-400"
                      value={row.targetDose}
                      readOnly={readOnly}
                      onChange={e => updateRow(key, 'targetDose', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      className="bg-transparent border-b border-gray-600 w-20 focus:outline-none focus:border-blue-400"
                      value={row.unit}
                      readOnly={readOnly}
                      onChange={e => updateRow(key, 'unit', e.target.value)}
                    />
                  </td>
                  <td className={`py-1 pr-2 font-bold ${pctColor(p)}`}>{p}%</td>
                  <td className="py-1">
                    <input
                      type="checkbox"
                      checked={row.active}
                      disabled={readOnly}
                      onChange={e => updateRow(key, 'active', e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}

export default Renderer
