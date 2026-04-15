import type { FC } from 'react'
import { calcNIHSS, CITATION } from './Renderer'

const SEVERITY_LABELS: [number, number, string][] = [
  [0, 0, 'No Stroke'],
  [1, 4, 'Minor'],
  [5, 15, 'Moderate'],
  [16, 20, 'Moderate-Severe'],
  [21, 42, 'Severe'],
]

function getSeverity(score: number): string {
  return (
    SEVERITY_LABELS.find(([lo, hi]) => score >= lo && score <= hi)?.[2] ?? ''
  )
}

const ITEM_LABELS = [
  '1a — LOC', '1b — LOC Questions', '1c — LOC Commands', '2 — Best Gaze',
  '3 — Visual Fields', '4 — Facial Palsy', '5a — Motor Arm Left',
  '5b — Motor Arm Right', '6a — Motor Leg Left', '6b — Motor Leg Right',
  '7 — Limb Ataxia', '8 — Sensory', '9 — Best Language',
  '10 — Dysarthria', '11 — Extinction/Inattention',
]

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const raw = data as unknown as { items: number[] }
  const items = raw.items?.length === 15 ? raw.items : Array(15).fill(0)
  const total = calcNIHSS(items)
  return (
    <div className="font-sans text-black text-sm">
      <h3 className="font-bold text-base mb-2">NIH Stroke Scale (NIHSS)</h3>
      <table className="w-full border-collapse text-xs mb-2">
        <tbody>
          {ITEM_LABELS.map((label, idx) => (
            <tr key={idx} className="border-b border-gray-300">
              <td className="py-0.5 pr-2 text-gray-600">{label}</td>
              <td className="py-0.5 font-semibold text-right">
                {items[idx] === -1 ? 'UN' : items[idx]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="font-bold">
        Total: {total} — {getSeverity(total)}
      </div>
      <p className="text-xs italic text-gray-500 mt-1">{CITATION}</p>
    </div>
  )
}
