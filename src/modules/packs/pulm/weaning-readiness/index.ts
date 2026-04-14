import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const CITATION = 'Yang KL, Tobin MJ. NEJM. 1991;324(21):1445-1450'

/**
 * Rapid Shallow Breathing Index = RR / (TV in liters)
 * RSBI < 105 predicts successful extubation (70% sensitivity)
 */
export function calcRSBI(rr: number, tvMl: number): number {
  return rr / (tvMl / 1000)
}

export const WEAN_CHECKLIST_ITEMS: Array<{ key: string; label: string }> = [
  { key: 'oxygenation', label: 'Oxygenation adequate: FiO₂ ≤40% and SpO₂ ≥88-92%' },
  { key: 'peep', label: 'PEEP ≤5-8 cmH₂O' },
  { key: 'hemodynamics', label: 'Hemodynamically stable (no/minimal vasopressors)' },
  { key: 'drive', label: 'Adequate respiratory drive' },
  { key: 'neuro', label: 'GCS ≥8 or following commands' },
  { key: 'secretions', label: 'Secretions manageable (able to cough)' },
  { key: 'cause', label: 'Cause of respiratory failure improving' },
]

const weaningReadinessPlugin: ModulePlugin = {
  meta: {
    id: 'weaning-readiness',
    name: 'Weaning Readiness',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Daily wean readiness screen, RSBI calculator, and SBT attempt log.',
    tags: ['critical-care', 'pulmonology', 'ventilator', 'weaning', 'extubation'],
    pack: 'pulm',
  },
  schema: {
    config: {},
    data: {
      weanChecklist: { type: 'object' },
      rsbiRR: { type: 'number' },
      rsbiTV: { type: 'number' },
      sbtLog: { type: 'array' },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 6 },
  Renderer,
  Editor,
  PrintView,
}

export default weaningReadinessPlugin
