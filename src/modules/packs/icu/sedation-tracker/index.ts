import type { ModulePlugin } from '../../../../core/plugin/types'
import { SedationRenderer } from './Renderer'
import { SedationEditor } from './Editor'
import { SedationPrintView } from './PrintView'

export const sedationTrackerPlugin: ModulePlugin = {
  meta: {
    id: 'sedation-tracker',
    name: 'Sedation Tracker (RASS / CPOT)',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'RASS score selector with verbal descriptors, CPOT subscale entry, and configurable goal RASS range.',
    tags: ['icu', 'critical-care', 'sedation', 'pain', 'rass', 'cpot'],
    pack: 'icu',
  },
  schema: {
    config: {
      type: 'object',
      properties: {
        goalRassMin: { type: 'number', default: -2 },
        goalRassMax: { type: 'number', default: 0 },
      },
    },
    data: {
      type: 'object',
      properties: {
        rass: { type: 'number' },
        cpotFace: { type: 'number' },
        cpotBody: { type: 'number' },
        cpotMuscle: { type: 'number' },
        cpotCompliance: { type: 'number' },
        goalRassMin: { type: 'number' },
        goalRassMax: { type: 'number' },
      },
    },
  },
  defaultConfig: { goalRassMin: -2, goalRassMax: 0 },
  minSize: { w: 3, h: 4 },
  Renderer: SedationRenderer,
  Editor: SedationEditor,
  PrintView: SedationPrintView,
}
