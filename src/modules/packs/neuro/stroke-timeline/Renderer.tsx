import type { FC } from 'react'

export const CITATION =
  'Powers WJ et al. Stroke. 2019;50(12):e344-e418'

export function calcMinutesBetween(start: string, end: string): number | null {
  if (!start || !end) return null
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  if (isNaN(s) || isNaN(e)) return null
  return Math.round((e - s) / 60000)
}

const TICI_GRADES = ['', '0', '1', '2a', '2b', '3'] as const

interface StrokeData {
  lkw: string
  doorTime: string
  ctTime: string
  tpaDecision: string
  tpaAdmin: string
  groinTime: string
  recanalTime: string
  ticiGrade: string
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

interface IntervalDisplayProps {
  label: string
  minutes: number | null
  targetMin: number | null
  lowerIsBetter?: boolean
}

function IntervalDisplay({ label, minutes, targetMin, lowerIsBetter = true }: IntervalDisplayProps) {
  const exceeded = targetMin !== null && minutes !== null && lowerIsBetter && minutes > targetMin
  const onTarget = targetMin !== null && minutes !== null && lowerIsBetter && minutes <= targetMin
  const colorClass = exceeded
    ? 'text-red-400 font-bold'
    : onTarget
    ? 'text-green-400 font-bold'
    : 'text-gray-300'

  return (
    <div className="flex items-center justify-between text-xs py-0.5">
      <span className="text-gray-400">{label}</span>
      <div className="flex items-center gap-1">
        <span className={colorClass}>
          {minutes !== null ? `${minutes} min` : '—'}
        </span>
        {targetMin !== null && (
          <span className="text-gray-500 font-normal">
            (target ≤{targetMin})
          </span>
        )}
      </div>
    </div>
  )
}

function TimestampRow({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  disabled: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-400 w-40 flex-shrink-0">{label}</label>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="flex-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-200 px-2 py-0.5 disabled:opacity-50"
      />
    </div>
  )
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const raw = data as unknown as StrokeData
  const d: StrokeData = {
    lkw: raw.lkw ?? '',
    doorTime: raw.doorTime ?? '',
    ctTime: raw.ctTime ?? '',
    tpaDecision: raw.tpaDecision ?? '',
    tpaAdmin: raw.tpaAdmin ?? '',
    groinTime: raw.groinTime ?? '',
    recanalTime: raw.recanalTime ?? '',
    ticiGrade: raw.ticiGrade ?? '',
  }
  const disabled = mode === 'build'

  function update(patch: Partial<StrokeData>) {
    if (disabled) return
    onDataChange({ ...d, ...patch })
  }

  const onsetToDoor = calcMinutesBetween(d.lkw, d.doorTime)
  const doorToCT = calcMinutesBetween(d.doorTime, d.ctTime)
  const doorToNeedle = calcMinutesBetween(d.doorTime, d.tpaAdmin)
  const doorToGroin = calcMinutesBetween(d.doorTime, d.groinTime)

  return (
    <div className="p-3 space-y-2 text-sm text-gray-200">
      <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wide border-b border-gray-700 pb-0.5">
        Acute Stroke Timeline
      </h4>

      {/* Timestamp inputs */}
      <div className="space-y-1">
        <TimestampRow
          label="Last Known Well (LKW)"
          value={d.lkw}
          onChange={(v) => update({ lkw: v })}
          disabled={disabled}
        />
        <TimestampRow
          label="Door Arrival"
          value={d.doorTime}
          onChange={(v) => update({ doorTime: v })}
          disabled={disabled}
        />
        <TimestampRow
          label="CT Completed"
          value={d.ctTime}
          onChange={(v) => update({ ctTime: v })}
          disabled={disabled}
        />
        <TimestampRow
          label="IV tPA Decision"
          value={d.tpaDecision}
          onChange={(v) => update({ tpaDecision: v })}
          disabled={disabled}
        />
        <TimestampRow
          label="IV tPA Administration"
          value={d.tpaAdmin}
          onChange={(v) => update({ tpaAdmin: v })}
          disabled={disabled}
        />
        <TimestampRow
          label="Groin Puncture"
          value={d.groinTime}
          onChange={(v) => update({ groinTime: v })}
          disabled={disabled}
        />
        <TimestampRow
          label="Recanalization"
          value={d.recanalTime}
          onChange={(v) => update({ recanalTime: v })}
          disabled={disabled}
        />
      </div>

      {/* TICI grade */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-40 flex-shrink-0">TICI Grade</span>
        <select
          value={d.ticiGrade}
          onChange={(e) => !disabled && update({ ticiGrade: e.target.value })}
          disabled={disabled}
          className="flex-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-200 px-2 py-0.5 disabled:opacity-50"
        >
          {TICI_GRADES.map((g) => (
            <option key={g} value={g}>
              {g === '' ? '— Select —' : g}
            </option>
          ))}
        </select>
      </div>

      {/* Calculated intervals */}
      <div className="border-t border-gray-700 pt-2 space-y-0.5">
        <h4 className="text-xs font-semibold text-gray-300 mb-1">Calculated Intervals</h4>
        <IntervalDisplay label="Onset-to-Door" minutes={onsetToDoor} targetMin={null} />
        <IntervalDisplay label="Door-to-CT" minutes={doorToCT} targetMin={25} />
        <IntervalDisplay label="Door-to-Needle" minutes={doorToNeedle} targetMin={60} />
        <IntervalDisplay label="Door-to-Groin" minutes={doorToGroin} targetMin={90} />
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
