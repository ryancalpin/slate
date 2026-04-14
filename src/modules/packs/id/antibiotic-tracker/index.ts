import { ModulePlugin } from '../../../../core/plugin/types'
import { AntibioticRenderer } from './Renderer'
import { AntibioticEditor } from './Editor'
import { AntibioticPrintView } from './PrintView'

export const antibioticTrackerPlugin: ModulePlugin = {
  meta: {
    id: 'antibiotic-tracker',
    name: 'Antibiotic Tracker',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Track antibiotics: agent, dose, route, day of therapy, planned duration, renal dose adjustment.',
    tags: ['infectious-disease', 'antibiotics', 'pharmacology'],
    pack: 'id',
  },
  schema: {
    config: {},
    data: {
      antibiotics: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            agent: { type: 'string' },
            dose: { type: 'string' },
            route: { type: 'string' },
            startDate: { type: 'string' },
            durationDays: { type: 'number' },
            renalAdjust: { type: 'boolean' },
          },
        },
      },
    },
  },
  defaultConfig: {},
  minSize: { w: 6, h: 3 },
  Renderer: AntibioticRenderer,
  Editor: AntibioticEditor,
  PrintView: AntibioticPrintView,
}
