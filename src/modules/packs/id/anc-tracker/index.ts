import type { ModulePlugin } from '../../../../core/plugin/types'
import { AncRenderer } from './Renderer'
import { AncEditor } from './Editor'
import { AncPrintView } from './PrintView'

export const ancTrackerPlugin: ModulePlugin = {
  meta: {
    id: 'anc-tracker',
    name: 'ANC Tracker',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'ANC trend log with NCCN neutropenia classification and antifungal/antiviral lists.',
    tags: ['infectious-disease', 'hematology', 'neutropenia', 'oncology'],
    pack: 'id',
  },
  schema: {
    config: {},
    data: {
      entries: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            date: { type: 'string' },
            anc: { type: 'number' },
          },
        },
      },
      antifungals: { type: 'array', items: { type: 'string' } },
      antivirals: { type: 'array', items: { type: 'string' } },
    },
  },
  defaultConfig: {},
  minSize: { w: 4, h: 5 },
  Renderer: AncRenderer,
  Editor: AncEditor,
  PrintView: AncPrintView,
}
