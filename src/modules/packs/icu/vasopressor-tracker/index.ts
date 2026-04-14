import type { ModulePlugin } from '../../../../core/plugin/types'
import { VasopressorRenderer } from './Renderer'
import { VasopressorEditor } from './Editor'
import { VasopressorPrintView } from './PrintView'

export const vasopressorTrackerPlugin: ModulePlugin = {
  meta: {
    id: 'vasopressor-tracker',
    name: 'Vasopressor Tracker',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Track up to 4 simultaneous vasopressor agents with doses, MAP target, and MAP trend.',
    tags: ['icu', 'critical-care', 'hemodynamics', 'vasopressors'],
    pack: 'icu',
  },
  schema: {
    config: {
      type: 'object',
      properties: {
        defaultMapTarget: { type: 'number', default: 65 },
      },
    },
    data: {
      type: 'object',
      properties: {
        pressors: { type: 'array' },
        mapReadings: { type: 'array' },
      },
    },
  },
  defaultConfig: { defaultMapTarget: 65 },
  minSize: { w: 4, h: 3 },
  Renderer: VasopressorRenderer,
  Editor: VasopressorEditor,
  PrintView: VasopressorPrintView,
}
