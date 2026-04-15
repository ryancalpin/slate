import type { FC } from 'react'

interface HDData { access: string; bfr: number; dfr: number; ufGoal: number; duration: number; anticoag: string }
interface CRRTData { mode: string; effluentRate: number; replacementRate: number; anticoag: string; filterAge: number }
interface PDData { dwellVol: number; dwellTime: number; cyclesPerDay: number; glucoseConc: string; dailyUF: number }
interface DialysisData { modality: 'HD' | 'CRRT' | 'PD'; hd: HDData; crrt: CRRTData; pd: PDData }

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

function row(label: string, value: string | number) {
  return (
    <tr key={label}>
      <td className="pr-4 font-medium text-gray-600 py-0.5">{label}</td>
      <td className="text-gray-900">{value}</td>
    </tr>
  )
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as unknown as DialysisData
  return (
    <div className="text-sm">
      <p className="font-bold mb-1">Dialysis Settings — {d.modality}</p>
      <table className="border-collapse">
        <tbody>
          {d.modality === 'HD' && <>
            {row('Access', d.hd.access)}
            {row('Blood Flow Rate', `${d.hd.bfr} mL/min`)}
            {row('Dialysate Flow Rate', `${d.hd.dfr} mL/min`)}
            {row('UF Goal', `${d.hd.ufGoal} L`)}
            {row('Session Duration', `${d.hd.duration} hr`)}
            {row('Anticoagulation', d.hd.anticoag)}
          </>}
          {d.modality === 'CRRT' && <>
            {row('Mode', d.crrt.mode)}
            {row('Effluent Rate', `${d.crrt.effluentRate} mL/kg/hr`)}
            {row('Replacement Fluid Rate', `${d.crrt.replacementRate} mL/hr`)}
            {row('Anticoagulation', d.crrt.anticoag)}
            {row('Filter Age', `${d.crrt.filterAge} hr`)}
          </>}
          {d.modality === 'PD' && <>
            {row('Dwell Volume', `${d.pd.dwellVol} mL`)}
            {row('Dwell Time', `${d.pd.dwellTime} hr`)}
            {row('Cycles/Day', d.pd.cyclesPerDay)}
            {row('Glucose Concentration', d.pd.glucoseConc)}
            {row('Daily UF Achieved', `${d.pd.dailyUF} mL`)}
          </>}
        </tbody>
      </table>
    </div>
  )
}
