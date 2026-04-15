import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { templateStore } from '../../core/storage/templateStore'
import { extractCensusSummary, type CensusSummary } from '../../core/census/censusUtils'
import type { Template } from '../../core/template/types'

function VitalsChip({ label, value, unit }: { label: string; value?: number; unit?: string }) {
  if (value === undefined) return null
  return (
    <span className="inline-flex items-center gap-0.5 text-xs bg-gray-800 rounded px-1.5 py-0.5">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium text-white">
        {value}
        {unit && <span className="text-gray-400">{unit}</span>}
      </span>
    </span>
  )
}

function CensusCard({ summary, onClick }: { summary: CensusSummary; onClick: () => void }) {
  const bpText =
    summary.vitals.bp_systolic !== undefined && summary.vitals.bp_diastolic !== undefined
      ? `${summary.vitals.bp_systolic}/${summary.vitals.bp_diastolic}`
      : undefined

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-4 rounded-lg bg-[rgb(var(--color-surface-raised))] border border-gray-700 hover:border-accent transition-colors space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-white">{summary.label || 'Unnamed'}</div>
          {summary.room && (
            <div className="text-xs text-gray-400">Room {summary.room}</div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-gray-400 leading-tight">Day {summary.admitDayNumber}</div>
          {summary.flaggedAbnormalsCount > 0 && (
            <div className="text-xs text-red-400 font-medium mt-0.5">
              {summary.flaggedAbnormalsCount} abnormal
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <VitalsChip label="HR " value={summary.vitals.hr} unit=" bpm" />
        {bpText && (
          <span className="inline-flex items-center gap-0.5 text-xs bg-gray-800 rounded px-1.5 py-0.5">
            <span className="text-gray-400">BP </span>
            <span className="font-medium text-white">{bpText}</span>
          </span>
        )}
        <VitalsChip label="T " value={summary.vitals.temp} unit="°C" />
        <VitalsChip label="SpO₂ " value={summary.vitals.spo2} unit="%" />
      </div>

      <div className={clsx('flex items-center gap-3 text-xs text-gray-400')}>
        <span>{summary.templateName}</span>
        {summary.pendingTaskCount > 0 && (
          <span className="text-amber-400 font-medium">{summary.pendingTaskCount} tasks</span>
        )}
      </div>
    </button>
  )
}

export function CensusView() {
  const navigate = useNavigate()
  const [summaries, setSummaries] = useState<CensusSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const templates = (await templateStore.list()) as Template[]
        const all = templates.flatMap((t) => extractCensusSummary(t))
        setSummaries(all)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const handleCardClick = useCallback(
    (summary: CensusSummary) => {
      navigate(`/template/${summary.templateId}`)
    },
    [navigate],
  )

  return (
    <div className="min-h-screen bg-[rgb(var(--color-surface))] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Census</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
        </div>

        {loading && (
          <p className="text-gray-400 text-sm">Loading patient data…</p>
        )}

        {!loading && summaries.length === 0 && (
          <div className="text-center py-20 text-gray-500 space-y-4">
            <p className="text-lg text-gray-300">No patients yet</p>
            <p className="text-sm">
              Create a template, add modules, then switch to{' '}
              <span className="text-gray-300 font-medium">Live mode</span> to start entering patient data.
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-block mt-2 px-5 py-2 bg-accent text-white rounded text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Go to My Templates
            </button>
          </div>
        )}

        {!loading && summaries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {summaries.map((s) => (
              <CensusCard
                key={`${s.templateId}-${s.slotId}`}
                summary={s}
                onClick={() => handleCardClick(s)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
