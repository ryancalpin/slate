import type { FC } from 'react'
import { calcMinutesBetween, CITATION } from './Renderer'

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
  config: Record<string, unknown>
  data: Record<string, unknown>
}

function fmt(ts: string): string {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return ts
  }
}

function minLabel(min: number | null, target: number | null): string {
  if (min === null) return '—'
  const flag = target !== null && min > target ? ' ⚠ EXCEEDED' : ''
  return `${min} min${flag}`
}

export const PrintView: FC<Props> = ({ data }) => {
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

  const onsetToDoor = calcMinutesBetween(d.lkw, d.doorTime)
  const doorToCT = calcMinutesBetween(d.doorTime, d.ctTime)
  const doorToNeedle = calcMinutesBetween(d.doorTime, d.tpaAdmin)
  const doorToGroin = calcMinutesBetween(d.doorTime, d.groinTime)

  return (
    <div className="font-sans text-black text-sm space-y-2">
      <h3 className="font-bold text-base">Stroke Timeline</h3>
      <table className="w-full border-collapse text-xs">
        <tbody>
          {[
            ['Last Known Well', d.lkw],
            ['Door Arrival', d.doorTime],
            ['CT Completed', d.ctTime],
            ['IV tPA Decision', d.tpaDecision],
            ['IV tPA Administration', d.tpaAdmin],
            ['Groin Puncture', d.groinTime],
            ['Recanalization', d.recanalTime],
          ].map(([label, val]) => (
            <tr key={label} className="border-b border-gray-200">
              <td className="py-0.5 pr-2 text-gray-600">{label}</td>
              <td className="py-0.5 font-semibold">{fmt(val)}</td>
            </tr>
          ))}
          {d.ticiGrade && (
            <tr className="border-b border-gray-200">
              <td className="py-0.5 pr-2 text-gray-600">TICI Grade</td>
              <td className="py-0.5 font-semibold">TICI {d.ticiGrade}</td>
            </tr>
          )}
        </tbody>
      </table>
      <h4 className="font-semibold text-xs mt-1">Intervals</h4>
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-0.5 pr-2 text-gray-600">Onset-to-Door</td>
            <td className="py-0.5">{minLabel(onsetToDoor, null)}</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-0.5 pr-2 text-gray-600">Door-to-CT (target ≤25 min)</td>
            <td className="py-0.5">{minLabel(doorToCT, 25)}</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-0.5 pr-2 text-gray-600">Door-to-Needle (target ≤60 min)</td>
            <td className="py-0.5">{minLabel(doorToNeedle, 60)}</td>
          </tr>
          <tr>
            <td className="py-0.5 pr-2 text-gray-600">Door-to-Groin (target ≤90 min)</td>
            <td className="py-0.5">{minLabel(doorToGroin, 90)}</td>
          </tr>
        </tbody>
      </table>
      <p className="text-xs italic text-gray-500 mt-1">{CITATION}</p>
    </div>
  )
}
