import type { ModulePlugin } from '../../../../core/plugin/types'
import { CultureRenderer } from './Renderer'
import { CultureEditor } from './Editor'
import { CulturePrintView } from './PrintView'

export const cultureLogPlugin: ModulePlugin = {
  meta: {
    id: 'culture-log',
    name: 'Culture Log',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Log culture results: source, organism, gram stain, sensitivities, and treatment implications.',
    tags: ['infectious-disease', 'microbiology', 'cultures'],
    pack: 'id',
  },
  schema: {
    config: {},
    data: {
      cultures: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            date: { type: 'string' },
            source: { type: 'string' },
            organism: { type: 'string' },
            gramStain: { type: 'string' },
            sensitivities: { type: 'string' },
            implications: { type: 'string' },
          },
        },
      },
    },
  },
  defaultConfig: {},
  minSize: { w: 8, h: 3 },
  Renderer: CultureRenderer,
  Editor: CultureEditor,
  PrintView: CulturePrintView,
}
