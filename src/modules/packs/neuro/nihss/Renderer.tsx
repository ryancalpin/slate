import type { FC } from 'react'

export const CITATION = 'Brott T et al. Stroke. 1989;20(7):864-870'

// UN sentinel: -1 (untestable — items 5a, 5b, 6a, 6b, 7, 10)
export function calcNIHSS(items: number[]): number {
  return items.reduce((sum, v) => sum + (v < 0 ? 0 : v), 0)
}

function severityLabel(score: number): string {
  if (score === 0) return 'No Stroke'
  if (score <= 4) return 'Minor'
  if (score <= 15) return 'Moderate'
  if (score <= 20) return 'Moderate-Severe'
  return 'Severe'
}

function severityColor(score: number): string {
  if (score === 0) return 'text-green-400'
  if (score <= 4) return 'text-yellow-400'
  if (score <= 15) return 'text-orange-400'
  if (score <= 20) return 'text-red-400'
  return 'text-red-600'
}

interface NIHSSItem {
  label: string
  max: number
  options: { value: number | 'UN'; label: string }[]
}

const NIHSS_ITEMS: NIHSSItem[] = [
  {
    label: '1a — LOC',
    max: 3,
    options: [
      { value: 0, label: '0 — Alert' },
      { value: 1, label: '1 — Arousable' },
      { value: 2, label: '2 — Repeated stimulation' },
      { value: 3, label: '3 — Unresponsive' },
    ],
  },
  {
    label: '1b — LOC Questions',
    max: 2,
    options: [
      { value: 0, label: '0 — Both correct' },
      { value: 1, label: '1 — One correct' },
      { value: 2, label: '2 — Neither' },
    ],
  },
  {
    label: '1c — LOC Commands',
    max: 2,
    options: [
      { value: 0, label: '0 — Both obey' },
      { value: 1, label: '1 — One obeys' },
      { value: 2, label: '2 — Neither' },
    ],
  },
  {
    label: '2 — Best Gaze',
    max: 2,
    options: [
      { value: 0, label: '0 — Normal' },
      { value: 1, label: '1 — Partial gaze palsy' },
      { value: 2, label: '2 — Forced deviation' },
    ],
  },
  {
    label: '3 — Visual Fields',
    max: 3,
    options: [
      { value: 0, label: '0 — No loss' },
      { value: 1, label: '1 — Partial hemianopia' },
      { value: 2, label: '2 — Complete hemianopia' },
      { value: 3, label: '3 — Bilateral' },
    ],
  },
  {
    label: '4 — Facial Palsy',
    max: 3,
    options: [
      { value: 0, label: '0 — Normal' },
      { value: 1, label: '1 — Minor' },
      { value: 2, label: '2 — Partial' },
      { value: 3, label: '3 — Complete' },
    ],
  },
  {
    label: '5a — Motor Arm Left',
    max: 4,
    options: [
      { value: 0, label: '0 — No drift' },
      { value: 1, label: '1 — Drift' },
      { value: 2, label: '2 — Some effort vs gravity' },
      { value: 3, label: '3 — No effort vs gravity' },
      { value: 4, label: '4 — No movement' },
      { value: 'UN', label: 'UN — Untestable' },
    ],
  },
  {
    label: '5b — Motor Arm Right',
    max: 4,
    options: [
      { value: 0, label: '0 — No drift' },
      { value: 1, label: '1 — Drift' },
      { value: 2, label: '2 — Some effort vs gravity' },
      { value: 3, label: '3 — No effort vs gravity' },
      { value: 4, label: '4 — No movement' },
      { value: 'UN', label: 'UN — Untestable' },
    ],
  },
  {
    label: '6a — Motor Leg Left',
    max: 4,
    options: [
      { value: 0, label: '0 — No drift' },
      { value: 1, label: '1 — Drift' },
      { value: 2, label: '2 — Some effort vs gravity' },
      { value: 3, label: '3 — No effort vs gravity' },
      { value: 4, label: '4 — No movement' },
      { value: 'UN', label: 'UN — Untestable' },
    ],
  },
  {
    label: '6b — Motor Leg Right',
    max: 4,
    options: [
      { value: 0, label: '0 — No drift' },
      { value: 1, label: '1 — Drift' },
      { value: 2, label: '2 — Some effort vs gravity' },
      { value: 3, label: '3 — No effort vs gravity' },
      { value: 4, label: '4 — No movement' },
      { value: 'UN', label: 'UN — Untestable' },
    ],
  },
  {
    label: '7 — Limb Ataxia',
    max: 2,
    options: [
      { value: 0, label: '0 — Absent' },
      { value: 1, label: '1 — One limb' },
      { value: 2, label: '2 — Two limbs' },
      { value: 'UN', label: 'UN — Untestable' },
    ],
  },
  {
    label: '8 — Sensory',
    max: 2,
    options: [
      { value: 0, label: '0 — Normal' },
      { value: 1, label: '1 — Mild-moderate loss' },
      { value: 2, label: '2 — Severe or absent' },
    ],
  },
  {
    label: '9 — Best Language',
    max: 3,
    options: [
      { value: 0, label: '0 — Normal' },
      { value: 1, label: '1 — Mild-moderate aphasia' },
      { value: 2, label: '2 — Severe aphasia' },
      { value: 3, label: '3 — Mute/global' },
    ],
  },
  {
    label: '10 — Dysarthria',
    max: 2,
    options: [
      { value: 0, label: '0 — Normal' },
      { value: 1, label: '1 — Mild-moderate' },
      { value: 2, label: '2 — Severe' },
      { value: 'UN', label: 'UN — Untestable' },
    ],
  },
  {
    label: '11 — Extinction / Inattention',
    max: 2,
    options: [
      { value: 0, label: '0 — Normal' },
      { value: 1, label: '1 — Inattention in one modality' },
      { value: 2, label: '2 — Profound inattention' },
    ],
  },
]

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

export const Renderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const raw = data as unknown as { items: number[] }
  const items: number[] = raw.items?.length === 15 ? raw.items : Array(15).fill(0)
  const total = calcNIHSS(items)

  const setItem = (idx: number, value: number | 'UN') => {
    if (mode === 'build') return
    const next = [...items]
    next[idx] = value === 'UN' ? -1 : (value as number)
    onDataChange({ items: next })
  }

  return (
    <div className="p-3 space-y-2 text-sm text-gray-200">
      {/* Header / total */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-base">NIHSS</span>
        <div className="text-right">
          <span className={`text-sm font-medium ${severityColor(total)}`}>
            {severityLabel(total)}
          </span>
          <span className="ml-2 text-xs text-gray-400">/ 42</span>
        </div>
      </div>

      {/* Score grid */}
      <div className="space-y-1">
        {NIHSS_ITEMS.map((item, idx) => {
          const current = items[idx]
          return (
            <div key={idx} className="flex flex-col gap-0.5">
              <span className="text-xs text-gray-400 font-medium">{item.label}</span>
              <div className="flex flex-wrap gap-1">
                {item.options.map((opt) => {
                  const isUN = opt.value === 'UN'
                  const storedVal = isUN ? -1 : (opt.value as number)
                  const active = current === storedVal
                  return (
                    <button
                      key={String(opt.value)}
                      onClick={() => setItem(idx, opt.value)}
                      disabled={mode === 'build'}
                      aria-label={String(opt.value)}
                      className={`px-2 py-0.5 rounded text-xs border transition-colors
                        ${active
                          ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                          : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}
                        ${mode === 'build' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Total row */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-700">
        <span className="font-semibold">Total</span>
        <span className={`text-xl font-bold ${severityColor(total)}`}>{total}</span>
      </div>

      <p className="text-xs italic text-gray-400 mt-1">{CITATION}</p>
    </div>
  )
}
