import { pluginRegistry } from '../../../../core/plugin/registry'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'
import type { ModulePlugin } from '../../../../core/plugin/types'

const plugin: ModulePlugin = {
  meta: {
    id: 'postpartum-assessment',
    name: 'Postpartum Assessment',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Fundal assessment, lochia, perineum, breastfeeding, and mood documentation.',
    tags: ['obgyn', 'postpartum', 'obstetrics'],
    pack: 'obgyn',
  },
  schema: {
    config: {},
    data: {
      type: 'object',
      properties: {
        fundalHeight: { type: 'number' },
        fundalFirmness: { type: 'string' },
        lochiaCharacter: { type: 'string' },
        lochiaVolume: { type: 'string' },
        perineumStatus: { type: 'string' },
        breastfeeding: { type: 'string' },
        moodNote: { type: 'string' },
      },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 4 },
  Renderer,
  Editor,
  PrintView,
}

pluginRegistry.register(plugin)
export default plugin
