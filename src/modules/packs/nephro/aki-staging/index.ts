import { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export const akiStaging: ModulePlugin = {
  meta: {
    id: 'aki-staging',
    name: 'AKI Staging',
    version: '1.0.0',
    author: 'nephro-pack',
    description: 'KDIGO AKI staging calculator (creatinine ratio + urine output)',
    tags: ['nephrology', 'AKI', 'KDIGO', 'creatinine', 'urine output'],
    pack: 'nephro',
  },
  schema: {
    config: {},
    data: {
      baseCr: 'number', currCr: 'number', weightKg: 'number',
      uoMl: 'number', timeHr: 'number', rrtInitiated: 'boolean', acuteRise48h: 'boolean',
    },
  },
  defaultConfig: {},
  minSize: { w: 4, h: 5 },
  Renderer,
  Editor,
  PrintView,
}
