import type { FC } from 'react'

const SOFA_CITATION = 'Singer M et al. JAMA. 2016;315(8):801-810'
const APACHE_CITATION = 'Knaus WA et al. Crit Care Med. 1985;13(10):818-829'

export function calcSOFA(
  resp: number,
  coag: number,
  liver: number,
  cardio: number,
  cns: number,
  renal: number
): number {
  return resp + coag + liver + cardio + cns + renal
}

export function calcAPACHEII(aps: number, age: number, chronic: number): number {
  return aps + age + chronic
}

interface SofaScores {
  pf: number
  platelets: number
  bilirubin: number
  cardio: number
  gcs: number
  creatinine: number
  uoPerDay: number
}

interface ApacheScores {
  aps: number
  ageYears: number
  chronicPoints: number
}

interface SofaApacheData {
  sofa: SofaScores
  apache: ApacheScores
}

interface Props {
  instanceId: string
  config: Record<string, unknown>
  data: Record<string, unknown>
  onDataChange: (data: Record<string, unknown>) => void
  mode: 'build' | 'live'
}

const SOFA_COMPONENTS: {
  key: keyof SofaScores
  label: string
  sublabel: string
  max: number
}[] = [
  {
    key: 'pf',
    label: 'Respiration',
    sublabel: 'P/F ratio (≥400=0, 300-399=1, 200-299=2, 100-199+vent=3, <100+vent=4)',
    max: 4,
  },
  {
    key: 'platelets',
    label: 'Coagulation',
    sublabel: 'Platelets ×10³/µL (≥150=0, 100-149=1, 50-99=2, 20-49=3, <20=4)',
    max: 4,
  },
  {
    key: 'bilirubin',
    label: 'Liver',
    sublabel: 'Bilirubin mg/dL (<1.2=0, 1.2-1.9=1, 2.0-5.9=2, 6.0-11.9=3, ≥12=4)',
    max: 4,
  },
  {
    key: 'cardio',
    label: 'Cardiovascular',
    sublabel: 'MAP/vasopressors (MAP≥70=0, <70=1, dopa≤5 or dobu=2, dopa>5 or NE/epi≤0.1=3, dopa>15 or NE/epi>0.1=4)',
    max: 4,
  },
  {
    key: 'gcs',
    label: 'CNS',
    sublabel: 'GCS (15=0, 13-14=1, 10-12=2, 6-9=3, <6=4)',
    max: 4,
  },
  {
    key: 'creatinine',
    label: 'Renal',
    sublabel: 'Cr mg/dL or UO (<1.2=0, 1.2-1.9=1, 2.0-3.4=2, 3.5-4.9 or UO<500=3, ≥5 or UO<200=4)',
    max: 4,
  },
]

const ScoreSelector: FC<{
  label: string
  sublabel: string
  value: number
  max: number
  onChange: (v: number) => void
  disabled: boolean
}> = ({ label, sublabel, value, max, onChange, disabled }) => (
  <div className="py-2 border-b border-gray-700 last:border-0">
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-200">{label}</p>
        <p className="text-xs text-gray-500 leading-tight mt-0.5">{sublabel}</p>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        {Array.from({ length: max + 1 }, (_, i) => i).map((v) => (
          <button
            key={v}
            onClick={() => onChange(v)}
            disabled={disabled}
            className={`w-7 h-7 rounded text-xs font-bold transition-colors ${
              value === v
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:cursor-not-allowed`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  </div>
)

export const SofaApacheRenderer: FC<Props> = ({ data, onDataChange, mode }) => {
  const d = data as unknown as SofaApacheData
  const sofa: SofaScores = d.sofa ?? {
    pf: 0, platelets: 0, bilirubin: 0, cardio: 0, gcs: 0, creatinine: 0, uoPerDay: 0,
  }
  const apache: ApacheScores = d.apache ?? { aps: 0, ageYears: 0, chronicPoints: 0 }

  const sofaTotal = calcSOFA(
    sofa.pf, sofa.platelets, sofa.bilirubin, sofa.cardio, sofa.gcs, sofa.creatinine
  )
  const apacheTotal = calcAPACHEII(apache.aps, apache.ageYears, apache.chronicPoints)

  const updateSofa = (key: keyof SofaScores, value: number) =>
    onDataChange({ ...d, sofa: { ...sofa, [key]: value } })

  const updateApache = (key: keyof ApacheScores, value: number) =>
    onDataChange({ ...d, apache: { ...apache, [key]: value } })

  return (
    <div className="p-3 space-y-5">
      {/* SOFA Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-gray-200">Organ Failure Score</h3>
          <div className="text-right">
            <span className="text-xs text-gray-400">SOFA Total</span>
            <span className="ml-2 text-lg font-bold text-blue-300">{sofaTotal}</span>
            <span className="text-xs text-gray-500"> / 24</span>
          </div>
        </div>

        <div>
          {SOFA_COMPONENTS.map((comp) => (
            <ScoreSelector
              key={comp.key}
              label={comp.label}
              sublabel={comp.sublabel}
              value={sofa[comp.key] ?? 0}
              max={comp.max}
              onChange={(v) => updateSofa(comp.key, v)}
              disabled={mode === 'build'}
            />
          ))}
        </div>
        <p className="text-xs italic text-gray-400 mt-2">{SOFA_CITATION}</p>
      </div>

      {/* APACHE II Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-gray-200">Severity Score</h3>
          <div className="text-right">
            <span className="text-xs text-gray-400">APACHE II Total</span>
            <span className="ml-2 text-lg font-bold text-orange-300">{apacheTotal}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              APS (Acute Physiology Score, 0-60)
            </label>
            <p className="text-xs text-gray-500 mb-1 leading-tight">
              Sum of 12 APS variables: temp, MAP, HR, RR, A-a gradient/PaO2, pH, Na, K, Cr (×2 if ARF), Hct, WBC, GCS score (15 − actual GCS)
            </p>
            <input
              type="number"
              value={apache.aps}
              min={0}
              max={60}
              onChange={(e) => updateApache('aps', parseInt(e.target.value) || 0)}
              disabled={mode === 'build'}
              className="bg-gray-800 text-gray-100 rounded px-2 py-1 text-sm w-24"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Age Points
            </label>
            <p className="text-xs text-gray-500 mb-1">&lt;44=0, 45-54=2, 55-64=3, 65-74=5, ≥75=6</p>
            <div className="flex gap-1">
              {[
                { label: '<44', value: 0 },
                { label: '45-54', value: 2 },
                { label: '55-64', value: 3 },
                { label: '65-74', value: 5 },
                { label: '≥75', value: 6 },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => updateApache('ageYears', value)}
                  disabled={mode === 'build'}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                    apache.ageYears === value
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } disabled:cursor-not-allowed`}
                >
                  {label}
                  <span className="block text-xs opacity-70">+{value}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Chronic Health Points
            </label>
            <p className="text-xs text-gray-500 mb-1">
              None=0; Elective post-op=2; Emergency/non-op with chronic organ insufficiency or immunocompromised=5
            </p>
            <div className="flex gap-1">
              {[
                { label: 'None', value: 0 },
                { label: 'Elective', value: 2 },
                { label: 'Emergency', value: 5 },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => updateApache('chronicPoints', value)}
                  disabled={mode === 'build'}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    apache.chronicPoints === value
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } disabled:cursor-not-allowed`}
                >
                  {label}
                  <span className="block text-xs opacity-70">+{value}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs italic text-gray-400 mt-2">{APACHE_CITATION}</p>
      </div>
    </div>
  )
}
