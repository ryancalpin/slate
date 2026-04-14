import type { FC } from 'react'
import { calcCPP, CITATION } from './Renderer'

type Reactivity = 'brisk' | 'sluggish' | 'fixed'

interface PupilData {
  sizeMm: number
  reactivity: Reactivity
}

interface ICPData {
  icp: number
  map: number
  cppTarget: number
  pupilL: PupilData
  pupilR: PupilData
  evdEnabled: boolean
  evd: {
    refLevel: number
    drainThreshold: number
    drainRate: number
  }
}

interface Props {
  config: Record<string, unknown>
  data: ICPData
}

export const PrintView: FC<Props> = ({ data }) => {
  const d: ICPData = {
    icp: data.icp ?? 15,
    map: data.map ?? 80,
    cppTarget: data.cppTarget ?? 60,
    pupilL: data.pupilL ?? { sizeMm: 3, reactivity: 'brisk' },
    pupilR: data.pupilR ?? { sizeMm: 3, reactivity: 'brisk' },
    evdEnabled: data.evdEnabled ?? false,
    evd: data.evd ?? { refLevel: 0, drainThreshold: 20, drainRate: 0 },
  }
  const cpp = calcCPP(d.map, d.icp)

  return (
    <div className="font-sans text-black text-sm space-y-2">
      <h3 className="font-bold text-base">ICP Monitor</h3>
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr className="border-b border-gray-300">
            <td className="py-0.5 pr-2 text-gray-600">ICP</td>
            <td className="py-0.5 font-semibold">{d.icp} mmHg</td>
          </tr>
          <tr className="border-b border-gray-300">
            <td className="py-0.5 pr-2 text-gray-600">MAP</td>
            <td className="py-0.5 font-semibold">{d.map} mmHg</td>
          </tr>
          <tr className="border-b border-gray-300">
            <td className="py-0.5 pr-2 text-gray-600">CPP (MAP − ICP)</td>
            <td className="py-0.5 font-bold">{cpp} mmHg</td>
          </tr>
          <tr className="border-b border-gray-300">
            <td className="py-0.5 pr-2 text-gray-600">Pupil L</td>
            <td className="py-0.5">{d.pupilL.sizeMm} mm — {d.pupilL.reactivity}</td>
          </tr>
          <tr className="border-b border-gray-300">
            <td className="py-0.5 pr-2 text-gray-600">Pupil R</td>
            <td className="py-0.5">{d.pupilR.sizeMm} mm — {d.pupilR.reactivity}</td>
          </tr>
          {d.evdEnabled && (
            <>
              <tr className="border-b border-gray-300">
                <td className="py-0.5 pr-2 text-gray-600">EVD Ref Level</td>
                <td className="py-0.5">{d.evd.refLevel} cmH₂O</td>
              </tr>
              <tr className="border-b border-gray-300">
                <td className="py-0.5 pr-2 text-gray-600">EVD Drain Threshold</td>
                <td className="py-0.5">{d.evd.drainThreshold} mmHg</td>
              </tr>
              <tr>
                <td className="py-0.5 pr-2 text-gray-600">EVD Drain Rate</td>
                <td className="py-0.5">{d.evd.drainRate} mL/hr</td>
              </tr>
            </>
          )}
        </tbody>
      </table>
      <p className="text-xs italic text-gray-500 mt-1">{CITATION}</p>
    </div>
  )
}
