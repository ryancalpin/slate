import type { FC } from 'react'
import { calcFENa, calcFEUrea } from './Renderer'

const CITATION_FENA = 'Miller TR et al. Ann Intern Med. 1978;89(1):47-50'
const CITATION_FEUREA = 'Carvounis CP et al. Am J Kidney Dis. 2002;39(3):455-462'

interface UrineData {
  naU: number; crU: number; naS: number; crS: number
  ureaNu: number; ureaS: number; uOsm: number; proteinU: number
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

function row(label: string, value: string) {
  return <tr key={label}><td className="pr-4 font-medium text-gray-600 py-0.5">{label}</td><td>{value}</td></tr>
}

export const PrintView: FC<Props> = ({ data }) => {
  const d = data as unknown as UrineData
  const fena = calcFENa(d.naU, d.crS, d.naS, d.crU)
  const feurea = calcFEUrea(d.ureaNu, d.crS, d.ureaS, d.crU)
  const protCr = d.crU > 0 ? d.proteinU / d.crU : 0

  return (
    <div className="text-sm">
      <p className="font-bold mb-1">Urine Studies</p>
      <table className="border-collapse text-xs">
        <tbody>
          {row('Urine Na', `${d.naU} mEq/L`)}
          {row('Urine Cr', `${d.crU} mg/dL`)}
          {row('Serum Na', `${d.naS} mEq/L`)}
          {row('Serum Cr', `${d.crS} mg/dL`)}
          {row('Urine Urea N', `${d.ureaNu} mg/dL`)}
          {row('BUN', `${d.ureaS} mg/dL`)}
          {row('Urine Osmolality', `${d.uOsm} mOsm/kg`)}
          {row('Urine Protein', `${d.proteinU} mg/dL`)}
        </tbody>
      </table>
      <div className="mt-2 space-y-1">
        <p className="font-semibold text-xs">FENa: {fena.toFixed(1)}%</p>
        <p className="text-xs italic text-gray-400">{CITATION_FENA}</p>
        <p className="font-semibold text-xs">FEUrea: {feurea.toFixed(1)}%</p>
        <p className="text-xs italic text-gray-400">{CITATION_FEUREA}</p>
        <p className="font-semibold text-xs">Protein/Cr Ratio: {protCr.toFixed(2)}</p>
      </div>
    </div>
  )
}
