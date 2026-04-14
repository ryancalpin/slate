import { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const urineStudies: ModulePlugin = {
  meta: {
    id: 'urine-studies',
    name: 'Urine Studies',
    version: '1.0.0',
    author: 'nephro-pack',
    description: 'FENa, FEUrea, and urine protein/Cr ratio with evidence-cited interpretations',
    tags: ['nephrology', 'FENa', 'FEUrea', 'urine', 'AKI', 'prerenal'],
    pack: 'nephro',
  },
  schema: {
    config: {},
    data: {
      naU: 'number', crU: 'number', naS: 'number', crS: 'number',
      ureaNu: 'number', ureaS: 'number', uOsm: 'number', proteinU: 'number',
    },
  },
  defaultConfig: {},
  minSize: { w: 4, h: 6 },
  Renderer,
  Editor,
  PrintView,
}
