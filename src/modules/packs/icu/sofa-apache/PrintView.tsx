import type { FC } from 'react'
import { calcSOFA, calcAPACHEII } from './Renderer'

const SOFA_CITATION = 'Singer M et al. JAMA. 2016;315(8):801-810'
const APACHE_CITATION = 'Knaus WA et al. Crit Care Med. 1985;13(10):818-829'

const AGE_LABELS: Record<number, string> = {
  0: '<44 yr',
  2: '45-54 yr',
  3: '55-64 yr',
  5: '65-74 yr',
  6: '≥75 yr',
}

const CHRONIC_LABELS: Record<number, string> = {
  0: 'None',
  2: 'Elective post-op',
  5: 'Emergency / non-op',
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

export const SofaApachePrintView: FC<Props> = ({ data }) => {
  const sofa = (data.sofa as Record<string, number>) ?? {}
  const apache = (data.apache as Record<string, number>) ?? {}

  const sofaTotal = calcSOFA(
    sofa.pf ?? 0,
    sofa.platelets ?? 0,
    sofa.bilirubin ?? 0,
    sofa.cardio ?? 0,
    sofa.gcs ?? 0,
    sofa.creatinine ?? 0
  )
  const apacheTotal = calcAPACHEII(apache.aps ?? 0, apache.ageYears ?? 0, apache.chronicPoints ?? 0)

  return (
    <div className="font-mono text-sm space-y-4">
      <h3 className="font-bold text-base">SOFA / APACHE II</h3>

      <div>
        <p className="font-semibold">SOFA Score: {sofaTotal} / 24</p>
        <table className="w-full border border-gray-300 text-xs mt-1">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-1 text-left">Component</th>
              <th className="border border-gray-300 px-2 py-1 text-left">Score</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Respiration (P/F)', value: sofa.pf ?? 0 },
              { label: 'Coagulation (Platelets)', value: sofa.platelets ?? 0 },
              { label: 'Liver (Bilirubin)', value: sofa.bilirubin ?? 0 },
              { label: 'Cardiovascular (MAP/pressors)', value: sofa.cardio ?? 0 },
              { label: 'CNS (GCS)', value: sofa.gcs ?? 0 },
              { label: 'Renal (Cr / UO)', value: sofa.creatinine ?? 0 },
            ].map(({ label, value }) => (
              <tr key={label}>
                <td className="border border-gray-300 px-2 py-1">{label}</td>
                <td className="border border-gray-300 px-2 py-1">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs italic text-gray-500 mt-1">{SOFA_CITATION}</p>
      </div>

      <div>
        <p className="font-semibold">APACHE II Score: {apacheTotal}</p>
        <ul className="ml-4 text-xs space-y-0.5 mt-1">
          <li>APS: {apache.aps ?? 0}</li>
          <li>Age: {AGE_LABELS[apache.ageYears ?? 0] ?? apache.ageYears} (+{apache.ageYears ?? 0})</li>
          <li>
            Chronic Health: {CHRONIC_LABELS[apache.chronicPoints ?? 0] ?? apache.chronicPoints} (+{apache.chronicPoints ?? 0})
          </li>
        </ul>
        <p className="text-xs italic text-gray-500 mt-1">{APACHE_CITATION}</p>
      </div>
    </div>
  )
}
