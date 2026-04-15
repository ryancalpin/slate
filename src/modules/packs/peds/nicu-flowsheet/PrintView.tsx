import type { FC } from 'react'
import { CITATION } from './index'

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as { tpn?: Record<string, number>; uac?: Record<string, string>; uvc?: Record<string, string>; weights?: { date: string; weightG: number }[] }
  const tpn = d.tpn ?? {}
  const uac = d.uac ?? {}
  const uvc = d.uvc ?? {}
  const weights = d.weights ?? []

  return (
    <div className="text-sm space-y-2">
      <h3 className="font-bold">NICU Flowsheet</h3>

      <div>
        <strong>TPN:</strong> Dextrose {tpn.dextrose ?? '—'} g/kg/d | AA {tpn.aa ?? '—'} g/kg/d | Lipids {tpn.lipids ?? '—'} g/kg/d | Ca {tpn.calcium ?? '—'} mEq/kg/d | Phos {tpn.phosphate ?? '—'} mmol/kg/d | Zn {tpn.zinc ?? '—'} mcg/kg/d
        <p className="text-xs italic text-gray-400">{CITATION}</p>
      </div>

      <div>
        <strong>UAC:</strong> {uac.position ?? '—'} | Inserted {uac.insertDate ?? '—'} | Removed {uac.removalDate ?? '—'} | Cx: {uac.complications ?? '—'}
      </div>

      <div>
        <strong>UVC:</strong> {uvc.position ?? '—'} | Inserted {uvc.insertDate ?? '—'} | Removed {uvc.removalDate ?? '—'} | Cx: {uvc.complications ?? '—'}
      </div>

      <div>
        <strong>Weight Trend:</strong>
        {weights.length === 0 ? ' None' : (
          <table className="text-xs mt-1">
            <thead><tr><th className="text-left pr-4">Date</th><th>Weight (g)</th></tr></thead>
            <tbody>
              {weights.map((w, i) => <tr key={i}><td className="pr-4">{w.date}</td><td>{w.weightG}</td></tr>)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
