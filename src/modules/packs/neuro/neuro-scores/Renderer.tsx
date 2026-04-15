import type { FC } from 'react'

export const CITATION_MRS = 'van Swieten JC et al. Stroke. 1988;19(5):604-607'
export const CITATION_GCS = 'Teasdale G, Jennett B. Lancet. 1974;2(8872):81-84'
export const CITATION_HUNT_HESS = 'Hunt WE, Hess RM. J Neurosurg. 1968;28(1):14-20'
export const CITATION_FISHER = 'Fisher CM et al. Neurosurgery. 1980;6(1):1-9'

export function calcGCS(e: number, v: number, m: number): number {
  return e + v + m
}

const MRS_OPTIONS = [
  { value: 0, label: '0 — No symptoms' },
  { value: 1, label: '1 — No significant disability' },
  { value: 2, label: '2 — Slight disability' },
  { value: 3, label: '3 — Moderate disability (needs help walking)' },
  { value: 4, label: '4 — Moderately severe (unable to walk without help)' },
  { value: 5, label: '5 — Severe disability (bedridden)' },
  { value: 6, label: '6 — Dead' },
]

const GCS_EYES = [
  { v: 1, label: '1 — None' },
  { v: 2, label: '2 — To pain' },
  { v: 3, label: '3 — To speech' },
  { v: 4, label: '4 — Spontaneous' },
]

const GCS_VERBAL = [
  { v: 1, label: '1 — None' },
  { v: 2, label: '2 — Incomprehensible' },
  { v: 3, label: '3 — Inappropriate' },
  { v: 4, label: '4 — Confused' },
  { v: 5, label: '5 — Oriented' },
]

const GCS_MOTOR = [
  { v: 1, label: '1 — None' },
  { v: 2, label: '2 — Extension' },
  { v: 3, label: '3 — Abnormal flexion' },
  { v: 4, label: '4 — Withdrawal' },
  { v: 5, label: '5 — Localizing' },
  { v: 6, label: '6 — Obeys commands' },
]

const HUNT_HESS_OPTIONS = [
  { value: 1, label: 'I — Asymptomatic or mild headache' },
  { value: 2, label: 'II — Moderate-severe headache, nuchal rigidity, no deficit' },
  { value: 3, label: 'III — Drowsiness or mild deficit' },
  { value: 4, label: 'IV — Stupor, moderate-severe hemiparesis' },
  { value: 5, label: 'V — Coma, decerebrate posturing' },
]

const FISHER_OPTIONS = [
  { value: 1, label: '1 — No blood on CT' },
  { value: 2, label: '2 — Diffuse thin (<1 mm)' },
  { value: 3, label: '3 — Clot or thick layer (≥1 mm)' },
  { value: 4, label: '4 — Intraparenchymal or intraventricular' },
]

interface Data {
  mrs: number
  gcsE: number
  gcsV: number
  gcsM: number
  huntHess: number
  fisherGrade: number
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wide border-b border-gray-700 pb-0.5 mb-1">
      {title}
    </h4>
  )
}

function SelectRow<T extends number>({
  value,
  options,
  onChange,
  disabled,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  disabled: boolean
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value) as T)}
      disabled={disabled}
      className="w-full bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 px-2 py-1 disabled:opacity-50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

function GCSButtons({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { v: number; label: string }[]
  value: number
  onChange: (v: number) => void
  disabled: boolean
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          disabled={disabled}
          title={o.label}
          aria-label={o.label}
          className={`px-2 py-0.5 rounded text-xs border transition-colors
            ${value === o.v
              ? 'bg-blue-600 border-blue-500 text-white font-bold'
              : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          {o.v}
        </button>
      ))}
    </div>
  )
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const raw = data as unknown as Data
  const d: Data = {
    mrs: raw.mrs ?? 0,
    gcsE: raw.gcsE ?? 4,
    gcsV: raw.gcsV ?? 5,
    gcsM: raw.gcsM ?? 6,
    huntHess: raw.huntHess ?? 1,
    fisherGrade: raw.fisherGrade ?? 1,
  }
  const disabled = mode === 'build'
  const gcsTotal = calcGCS(d.gcsE, d.gcsV, d.gcsM)

  function update(patch: Partial<Data>) {
    if (disabled) return
    onDataChange({ ...d, ...patch })
  }

  return (
    <div className="p-3 space-y-3 text-sm text-gray-200">

      {/* Modified Rankin Scale */}
      <div>
        <SectionHeader title="Modified Rankin Scale (mRS)" />
        <SelectRow
          value={d.mrs}
          options={MRS_OPTIONS}
          onChange={(v) => update({ mrs: v })}
          disabled={disabled}
        />
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_MRS}</p>
      </div>

      {/* GCS */}
      <div>
        <SectionHeader title="Glasgow Coma Scale (GCS)" />
        <div className="space-y-1 mb-1">
          <div>
            <span className="text-xs text-gray-400">Eyes (E)</span>
            <GCSButtons
              options={GCS_EYES}
              value={d.gcsE}
              onChange={(v) => update({ gcsE: v })}
              disabled={disabled}
            />
          </div>
          <div>
            <span className="text-xs text-gray-400">Verbal (V)</span>
            <GCSButtons
              options={GCS_VERBAL}
              value={d.gcsV}
              onChange={(v) => update({ gcsV: v })}
              disabled={disabled}
            />
          </div>
          <div>
            <span className="text-xs text-gray-400">Motor (M)</span>
            <GCSButtons
              options={GCS_MOTOR}
              value={d.gcsM}
              onChange={(v) => update({ gcsM: v })}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">Total:</span>
          <span className="text-xl font-bold text-white">{gcsTotal}</span>
          <span className="text-xs text-gray-400">
            (E{d.gcsE}+V{d.gcsV}+M{d.gcsM})
          </span>
        </div>
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_GCS}</p>
      </div>

      {/* Hunt-Hess */}
      <div>
        <SectionHeader title="Hunt-Hess Grade (SAH)" />
        <SelectRow
          value={d.huntHess}
          options={HUNT_HESS_OPTIONS}
          onChange={(v) => update({ huntHess: v })}
          disabled={disabled}
        />
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_HUNT_HESS}</p>
      </div>

      {/* Fisher Grade */}
      <div>
        <SectionHeader title="SAH CT Blood Grade" />
        <SelectRow
          value={d.fisherGrade}
          options={FISHER_OPTIONS}
          onChange={(v) => update({ fisherGrade: v })}
          disabled={disabled}
        />
        <p className="text-xs italic text-gray-400 mt-1">{CITATION_FISHER}</p>
      </div>

    </div>
  )
}
