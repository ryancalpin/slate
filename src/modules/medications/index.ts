import type { ModulePlugin } from '../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const medicationsPlugin: ModulePlugin = {
  meta: {
    id: 'medications',
    name: 'Medications',
    version: '1.0.0',
    author: 'core',
    description: 'Medication table with keyword-based highlight categories.',
    tags: ['medications', 'meds', 'pharmacy'],
  },
  schema: { config: {}, data: {} },
  defaultConfig: {
    categories: [
      { name: 'Vasopressors', keywords: 'norepi,epi,vasopressin,phenylephrine,dopamine', color: 'red' },
      { name: 'Antibiotics', keywords: 'vancomycin,piperacillin,cefepime,meropenem,azithromycin', color: 'yellow' },
      { name: 'Anticoagulants', keywords: 'heparin,enoxaparin,apixaban,rivaroxaban,warfarin', color: 'blue' },
    ],
  },
  minSize: { w: 6, h: 4 },
  Renderer,
  Editor,
  PrintView,
}
