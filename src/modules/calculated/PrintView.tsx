// src/modules/calculated/PrintView.tsx
interface CustomFormula {
  id: string
  name: string
  citation: string
}

interface Props {
  config: Record<string, unknown>
  data: Record<string, unknown>
}

const BUILTIN_LABELS: Record<string, string> = {
  'anion-gap': 'Anion Gap',
  'map': 'MAP',
  'bmi': 'BMI',
  'aa-gradient': 'A-a Gradient',
  'ckd-epi': 'CKD-EPI GFR 2021',
  'corrected-calcium': 'Corrected Calcium',
}

const CITATIONS: Record<string, string> = {
  'anion-gap': 'Emmett M & Narins RG, Medicine 1977;56(1):38-54',
  'map': 'Magder S, Crit Care 2016',
  'bmi': 'WHO, 1995',
  'aa-gradient': 'Sorbini CA et al., Respiration 1968;25(1):3-13',
  'ckd-epi': 'Inker LA et al., NEJM 2021;385(19):1737-1749',
  'corrected-calcium': 'Payne RB et al., BMJ 1973;4(5893):643-6',
}

export function PrintView({ config }: Props) {
  const enabledCalculators = (config.enabledCalculators as string[]) ?? []
  const customFormulas = (config.customFormulas as CustomFormula[]) ?? []

  return (
    <div className="text-sm">
      <h3 className="font-bold mb-1">Clinical Calculators</h3>
      <ul className="space-y-1 text-xs">
        {enabledCalculators.map((id) => (
          <li key={id}>
            <span className="font-medium">{BUILTIN_LABELS[id] ?? id}:</span>{' '}
            <span className="text-gray-400">—</span>{' '}
            <span className="italic text-gray-400">({CITATIONS[id]})</span>
          </li>
        ))}
        {customFormulas.map((f) => (
          <li key={f.id}>
            <span className="font-medium">{f.name}:</span>{' '}
            <span className="text-gray-400">—</span>{' '}
            <span className="italic text-gray-400">({f.citation})</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
