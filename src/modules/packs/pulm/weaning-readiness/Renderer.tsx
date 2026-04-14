import type { FC } from 'react'
import { CITATION, WEAN_CHECKLIST_ITEMS, calcRSBI } from './index'

interface SBTEntry {
  date: string
  duration: number
  outcome: 'pass' | 'fail'
  reason: string
}

interface WeanData {
  weanChecklist: Record<string, boolean>
  rsbiRR: number
  rsbiTV: number
  sbtLog: SBTEntry[]
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as Partial<WeanData>
  const isLive = mode === 'live'
  const checklist = d.weanChecklist ?? {}
  const sbtLog = (d.sbtLog ?? []) as SBTEntry[]

  const toggleCheck = (key: string) => {
    if (!isLive) return
    onDataChange({ ...data, weanChecklist: { ...checklist, [key]: !checklist[key] } })
  }

  const rsbi =
    d.rsbiRR != null && d.rsbiTV != null && d.rsbiTV > 0
      ? calcRSBI(d.rsbiRR, d.rsbiTV)
      : null

  const rsbiGood = rsbi != null && rsbi < 105

  const setNum = (field: keyof WeanData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onDataChange({ ...data, [field]: Number(e.target.value) })
  }

  const addSBT = () => {
    if (!isLive) return
    const entry: SBTEntry = {
      date: new Date().toISOString().slice(0, 10),
      duration: 0,
      outcome: 'pass',
      reason: '',
    }
    onDataChange({ ...data, sbtLog: [...sbtLog, entry] })
  }

  const updateSBT = (i: number, patch: Partial<SBTEntry>) => {
    const next = sbtLog.map((e, idx) => (idx === i ? { ...e, ...patch } : e))
    onDataChange({ ...data, sbtLog: next })
  }

  const removeSBT = (i: number) => {
    onDataChange({ ...data, sbtLog: sbtLog.filter((_, idx) => idx !== i) })
  }

  const inputCls =
    'rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm'

  const passedAll = WEAN_CHECKLIST_ITEMS.every((item) => checklist[item.key])

  return (
    <div className="p-3 space-y-4">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Weaning Readiness</h3>

      {/* Wean Checklist */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Daily Wean Screen</p>
        <div className="space-y-1">
          {WEAN_CHECKLIST_ITEMS.map(({ key, label }) => (
            <label key={key} className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-gray-300 text-blue-600"
                checked={checklist[key] ?? false}
                onChange={() => toggleCheck(key)}
                disabled={!isLive}
              />
              <span className="text-gray-700 dark:text-gray-300">{label}</span>
            </label>
          ))}
        </div>
        {passedAll && (
          <div className="mt-2 rounded bg-green-50 border border-green-300 px-3 py-1 text-sm text-green-800">
            All wean criteria met — consider SBT
          </div>
        )}
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* RSBI */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">RSBI (Rapid Shallow Breathing Index)</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-32 shrink-0">RR (br/min)</label>
            <input type="number" className={inputCls} value={d.rsbiRR ?? ''} onChange={setNum('rsbiRR')} readOnly={!isLive} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 w-32 shrink-0">Tidal Volume (mL)</label>
            <input type="number" className={inputCls} value={d.rsbiTV ?? ''} onChange={setNum('rsbiTV')} readOnly={!isLive} />
          </div>
        </div>
        {rsbi != null && (
          <div className={`mt-2 rounded border px-3 py-2 ${rsbiGood ? 'bg-green-50 border-green-300 text-green-800' : 'bg-amber-50 border-amber-300 text-amber-800'}`}>
            <span className="font-bold text-base">{rsbi.toFixed(1)}</span>
            <span className="ml-2 text-sm">
              {rsbiGood ? 'Favorable for extubation (<105)' : 'Unfavorable for extubation (≥105)'}
            </span>
          </div>
        )}
        <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      {/* SBT Log */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">SBT Log</p>
          {isLive && (
            <button
              onClick={addSBT}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              + Add SBT
            </button>
          )}
        </div>
        {sbtLog.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No SBT attempts recorded.</p>
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-1 pr-2">Date</th>
                <th className="pb-1 pr-2">Duration (min)</th>
                <th className="pb-1 pr-2">Outcome</th>
                <th className="pb-1 pr-2">Reason if fail</th>
                {isLive && <th className="pb-1"></th>}
              </tr>
            </thead>
            <tbody>
              {sbtLog.map((entry, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-1 pr-2">
                    {entry.date}
                    {isLive && (
                      <input
                        type="date"
                        className="sr-only"
                        value={entry.date}
                        onChange={(e) => updateSBT(i, { date: e.target.value })}
                        aria-label="SBT date"
                      />
                    )}
                  </td>
                  <td className="py-1 pr-2">
                    {isLive ? (
                      <input
                        type="number"
                        className={inputCls + ' w-16'}
                        value={entry.duration}
                        onChange={(e) => updateSBT(i, { duration: Number(e.target.value) })}
                      />
                    ) : entry.duration}
                  </td>
                  <td className="py-1 pr-2">
                    {isLive ? (
                      <select
                        className={inputCls}
                        value={entry.outcome}
                        onChange={(e) => updateSBT(i, { outcome: e.target.value as 'pass' | 'fail' })}
                      >
                        <option value="pass">Pass</option>
                        <option value="fail">Fail</option>
                      </select>
                    ) : (
                      <span className={entry.outcome === 'pass' ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                        {entry.outcome}
                      </span>
                    )}
                  </td>
                  <td className="py-1 pr-2">
                    {isLive ? (
                      <input
                        type="text"
                        className={inputCls + ' w-full'}
                        value={entry.reason}
                        placeholder="—"
                        onChange={(e) => updateSBT(i, { reason: e.target.value })}
                        disabled={entry.outcome === 'pass'}
                      />
                    ) : entry.reason || '—'}
                  </td>
                  {isLive && (
                    <td className="py-1">
                      <button
                        onClick={() => removeSBT(i)}
                        className="text-red-400 hover:text-red-600 text-xs"
                        aria-label="Remove SBT entry"
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
