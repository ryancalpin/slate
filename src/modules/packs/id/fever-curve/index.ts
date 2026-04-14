import { ModulePlugin } from '../../../../core/plugin/types'
import { FeverRenderer } from './Renderer'
import { FeverEditor } from './Editor'
import { FeverPrintView } from './PrintView'

export const feverCurvePlugin: ModulePlugin = {
  meta: {
    id: 'fever-curve',
    name: 'Fever Curve',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Temperature log with configurable fever threshold and sparkline trend visualization.',
    tags: ['infectious-disease', 'vitals', 'fever'],
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
            timestamp: { type: 'string' },
            tempC: { type: 'number' },
          },
        },
      },
      feverThresholdC: { type: 'number' },
    },
  },
  defaultConfig: {},
  minSize: { w: 4, h: 4 },
  Renderer: FeverRenderer,
  Editor: FeverEditor,
  PrintView: FeverPrintView,
}
