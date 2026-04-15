import { pluginRegistry } from '../../../../core/plugin/registry'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'
import type { ModulePlugin } from '../../../../core/plugin/types'

export const CITATION = 'Apgar V. Curr Res Anesth Analg. 1953;32(4):260-267'

export const COMPONENTS: { label: string; descriptions: string[] }[] = [
  {
    label: 'Appearance',
    descriptions: ['Blue all over', 'Blue extremities', 'Pink all over'],
  },
  {
    label: 'Pulse',
    descriptions: ['Absent', '<100 bpm', '≥100 bpm'],
  },
  {
    label: 'Grimace',
    descriptions: ['No response', 'Grimace', 'Cry / cough / sneeze'],
  },
  {
    label: 'Activity',
    descriptions: ['Limp', 'Some flexion', 'Active motion'],
  },
  {
    label: 'Respiration',
    descriptions: ['Absent', 'Weak / irregular', 'Strong cry'],
  },
]

export function calcApgar(scores: number[]): number {
  return scores.reduce((sum, v) => sum + (v ?? 0), 0)
}

const plugin: ModulePlugin = {
  meta: {
    id: 'apgar',
    name: 'Apgar Score',
    version: '1.0.0',
    author: 'patient-templates',
    description: '5-component Apgar scoring at 1-min, 5-min, and optional 10-min with auto-totals.',
    tags: ['peds', 'neonatology', 'apgar', 'delivery', 'nicu'],
    pack: 'peds',
  },
  schema: {
    config: {},
    data: {
      type: 'object',
      properties: {
        oneMin: { type: 'array', items: { type: 'number' } },
        fiveMin: { type: 'array', items: { type: 'number' } },
        tenMin: { type: 'array', items: { type: 'number' } },
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
