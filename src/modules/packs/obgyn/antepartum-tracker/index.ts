import { pluginRegistry } from '../../../../core/plugin/registry'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'
import type { ModulePlugin } from '../../../../core/plugin/types'

export function calcGA(lmpDate: string, today: string): { weeks: number; days: number } {
  // Parse as UTC to avoid timezone-induced day shifts
  const [ly, lm, ld] = lmpDate.split('-').map(Number)
  const [ty, tm, td] = today.split('-').map(Number)
  const lmp = Date.UTC(ly, lm - 1, ld)
  const now = Date.UTC(ty, tm - 1, td)
  const totalDays = Math.max(0, Math.floor((now - lmp) / (1000 * 60 * 60 * 24)))
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7 }
}

const plugin: ModulePlugin = {
  meta: {
    id: 'antepartum-tracker',
    name: 'Antepartum Tracker',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Tracks gestational age, FHR, contraction pattern, fetal presentation, and GBS status.',
    tags: ['obgyn', 'antepartum', 'obstetrics'],
    pack: 'obgyn',
  },
  schema: {
    config: {},
    data: {
      type: 'object',
      properties: {
        lmpDate: { type: 'string' },
        fhr: { type: 'number' },
        contractionFreq: { type: 'number' },
        contractionDuration: { type: 'number' },
        contractionRegularity: { type: 'string' },
        presentation: { type: 'string' },
        gbsStatus: { type: 'string' },
        gbsProphylaxis: { type: 'boolean' },
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
