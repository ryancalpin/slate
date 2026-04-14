import type { ModulePlugin } from '../../../../core/plugin/types'
import Renderer from './Renderer'
import Editor from './Editor'
import PrintView from './PrintView'

export const TIMI_ITEMS: string[] = [
  'Age ≥ 65',
  '≥ 3 CAD risk factors (FH, HTN, hyperlipidemia, DM, active smoking)',
  'Prior coronary stenosis ≥ 50%',
  'ST deviation on presenting ECG',
  '≥ 2 anginal events in prior 24 hours',
  'Use of aspirin in prior 7 days',
  'Elevated serum cardiac markers (troponin / CK-MB)',
]

export const TIMI_RISK_TABLE: { maxScore: number; risk: string }[] = [
  { maxScore: 1, risk: '4.7%' },
  { maxScore: 2, risk: '8.3%' },
  { maxScore: 3, risk: '13.2%' },
  { maxScore: 4, risk: '19.9%' },
  { maxScore: 5, risk: '26.2%' },
  { maxScore: 7, risk: '40.9%' },
]

export const GRACE_COMPONENTS: string[] = [
  'Age (points)',
  'Heart Rate (points)',
  'Systolic BP (points)',
  'Creatinine (points)',
  'Cardiac arrest at presentation (points)',
  'ST-segment deviation (points)',
  'Elevated cardiac enzymes (points)',
  'Killip class (points)',
]

export function calcTIMI(items: boolean[]): number {
  return items.reduce((sum, v) => sum + (v ? 1 : 0), 0)
}

export function interpretGRACE(score: number): 'low' | 'intermediate' | 'high' {
  if (score < 108) return 'low'
  if (score <= 140) return 'intermediate'
  return 'high'
}

export function timiRisk(score: number): string {
  for (const row of TIMI_RISK_TABLE) {
    if (score <= row.maxScore) return row.risk
  }
  return '40.9%'
}

const CardiacScoresPlugin: ModulePlugin = {
  meta: {
    id: 'cardiac-scores',
    name: 'Cardiac Risk Scores',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'TIMI (UA/NSTEMI) and GRACE (ACS) risk scores with evidence-based risk stratification.',
    tags: ['cardiology', 'acs', 'nstemi', 'risk-score', 'timi', 'grace'],
    pack: 'cardiology',
  },
  schema: {
    config: { type: 'object', properties: { title: { type: 'string' } } },
    data: {
      type: 'object',
      properties: {
        timiItems:       { type: 'array', items: { type: 'boolean' } },
        graceScore:      { type: 'number' },
        graceComponents: { type: 'object' },
      },
    },
  },
  defaultConfig: { title: 'Cardiac Risk Scores' },
  minSize: { w: 3, h: 5 },
  Renderer,
  Editor,
  PrintView,
}

export default CardiacScoresPlugin
