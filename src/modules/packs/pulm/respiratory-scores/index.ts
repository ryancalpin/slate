import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const CITATION_CURB65 = 'Lim WS et al. Thorax. 2003;58(5):377-382'
export const CITATION_BERLIN = 'ARDS Definition Task Force. JAMA. 2012;307(23):2526-2533'

/**
 * CURB-65 score — one point per criterion (max 5)
 * items[0] = Confusion, [1] = BUN >19, [2] = RR ≥30, [3] = SBP <90 or DBP ≤60, [4] = Age ≥65
 */
export function calcCURB65(items: boolean[]): number {
  return items.filter(Boolean).length
}

export function curb65Risk(score: number): { label: string; recommendation: string } {
  if (score <= 1) return { label: 'Low', recommendation: 'Consider outpatient treatment' }
  if (score === 2) return { label: 'Moderate', recommendation: 'Short inpatient stay or supervised outpatient' }
  return { label: 'Severe', recommendation: 'Inpatient; consider ICU if score 4-5' }
}

export function berlinClassify(pf: number, peep: number): string | null {
  if (peep < 5) return null // PEEP requirement not met
  if (pf > 300) return null // Not ARDS
  if (pf > 200) return 'Mild'
  if (pf > 100) return 'Moderate'
  return 'Severe'
}

const respiratoryScoresPlugin: ModulePlugin = {
  meta: {
    id: 'respiratory-scores',
    name: 'Respiratory Scores',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'CURB-65 pneumonia severity and Berlin ARDS classification.',
    tags: ['critical-care', 'pulmonology', 'pneumonia', 'ards', 'scoring'],
    pack: 'pulm',
  },
  schema: {
    config: {},
    data: {
      curb65: { type: 'array' },
      berlinOnset: { type: 'boolean' },
      berlinRadio: { type: 'boolean' },
      berlinNotCardiac: { type: 'boolean' },
      pf: { type: 'number' },
      peep: { type: 'number' },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 5 },
  Renderer,
  Editor,
  PrintView,
}

export default respiratoryScoresPlugin
