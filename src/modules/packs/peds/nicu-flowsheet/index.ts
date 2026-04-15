import { pluginRegistry } from '../../../../core/plugin/registry'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'
import type { ModulePlugin } from '../../../../core/plugin/types'

export const CITATION = 'Koletzko B et al. J Pediatr Gastroenterol Nutr. 2005;41(Suppl 2):S1-S87'

const plugin: ModulePlugin = {
  meta: {
    id: 'nicu-flowsheet',
    name: 'NICU Flowsheet',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'TPN components, UAC/UVC line tracking, and weight trend table for NICU patients.',
    tags: ['peds', 'nicu', 'neonatology', 'tpn'],
    pack: 'peds',
  },
  schema: {
    config: {},
    data: {
      type: 'object',
      properties: {
        tpn: { type: 'object' },
        uac: { type: 'object' },
        uvc: { type: 'object' },
        weights: { type: 'array' },
      },
    },
  },
  defaultConfig: {},
  minSize: { w: 4, h: 5 },
  Renderer,
  Editor,
  PrintView,
}

pluginRegistry.register(plugin)
export default plugin
