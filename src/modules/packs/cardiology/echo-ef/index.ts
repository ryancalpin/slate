import type { ModulePlugin } from '../../../../core/plugin/types'
import Renderer from './Renderer'
import Editor from './Editor'
import PrintView from './PrintView'

export function classifyEF(ef: number): 'HFrEF' | 'HFmrEF' | 'HFpEF' {
  if (ef < 40) return 'HFrEF'
  if (ef < 50) return 'HFmrEF'
  return 'HFpEF'
}

const EchoEFPlugin: ModulePlugin = {
  meta: {
    id: 'echo-ef',
    name: 'Echo / EF Summary',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Echocardiogram summary: EF with AHA/ACC 2022 HF classification, chamber dimensions, wall motion, valvular findings.',
    tags: ['cardiology', 'echo', 'heart-failure', 'ef'],
    pack: 'cardiology',
  },
  schema: {
    config: { type: 'object', properties: { title: { type: 'string' } } },
    data: {
      type: 'object',
      properties: {
        ef:         { type: 'number' },
        echoDate:   { type: 'string' },
        lvedd:      { type: 'number' },
        lvesd:      { type: 'number' },
        wallMotion: { type: 'string' },
        valvular:   { type: 'string' },
      },
    },
  },
  defaultConfig: { title: 'Echo / EF Summary' },
  minSize: { w: 3, h: 3 },
  Renderer,
  Editor,
  PrintView,
}

export default EchoEFPlugin
