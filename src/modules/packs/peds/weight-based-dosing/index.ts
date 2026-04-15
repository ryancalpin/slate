import { pluginRegistry } from '../../../../core/plugin/registry'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'
import type { ModulePlugin } from '../../../../core/plugin/types'

const plugin: ModulePlugin = {
  meta: {
    id: 'weight-based-dosing',
    name: 'Weight-Based Dosing',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Calculates total dose (mg) and volume (mL) from weight, dose per kg, and concentration.',
    tags: ['peds', 'dosing', 'neonatology', 'pharmacology'],
    pack: 'peds',
  },
  schema: {
    config: {},
    data: {
      type: 'object',
      properties: {
        drugName: { type: 'string' },
        weightKg: { type: 'number' },
        doseMgKg: { type: 'number' },
        frequency: { type: 'string' },
        concentrationMgMl: { type: 'number' },
      },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 3 },
  Renderer,
  Editor,
  PrintView,
}

pluginRegistry.register(plugin)
export default plugin
