import React from 'react'

const CITATION = 'EASL Clinical Practice Guidelines on the management of ascites. J Hepatol. 2010;52(5):691-694'

interface Paracentesis {
  date: string
  volumeL: number
  albuminGiven: boolean
}

interface AscitesData {
  paracenteses: Paracentesis[]
  fluidWbc: number
  sbpDiagnosed: boolean
  sbpTreatmentStarted: boolean
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const AscitesPrintView: React.FC<Props> = ({ data }) => {
  const d = data as unknown as AscitesData
  const paracenteses = d.paracenteses ?? []

  return (
    <div className="print-module">
      <h3 className="font-semibold text-sm mb-2">Ascites / Paracentesis Log</h3>
      {paracenteses.length > 0 ? (
        <table className="text-xs mb-2 w-full">
          <thead>
            <tr>
              <th className="text-left pr-3">Date</th>
              <th className="text-left pr-3">Volume (L)</th>
              <th className="text-left">Albumin Given</th>
            </tr>
          </thead>
          <tbody>
            {paracenteses.map((p, i) => (
              <tr key={i}>
                <td className="pr-3">{p.date || '—'}</td>
                <td className="pr-3">{p.volumeL}</td>
                <td>{p.albuminGiven ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      <p className="text-xs">Fluid WBC: {d.fluidWbc ?? 0} cells/µL</p>
      <p className="text-xs">SBP: {d.sbpDiagnosed ? 'Yes' : 'No'} | Treatment: {d.sbpTreatmentStarted ? 'Started' : 'Not started'}</p>
      <p className="text-xs italic text-gray-500 mt-1">{CITATION}</p>
    </div>
  )
}
