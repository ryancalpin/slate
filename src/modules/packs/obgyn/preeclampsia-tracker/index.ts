import { pluginRegistry } from '../../../../core/plugin/registry'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'
import type { ModulePlugin } from '../../../../core/plugin/types'

export const CITATION = 'ACOG Practice Bulletin No. 222. Obstet Gynecol. 2020;135(6):e237-e260'

export function calcMAP(sbp: number, dbp: number): number {
  return (sbp + 2 * dbp) / 3
}

export function hasSevereRange(
  bpLog: Array<{ sbp: number; dbp: number; timestamp: string }>
): boolean {
  const severe = bpLog.filter(r => r.sbp >= 160 || r.dbp >= 110)
  if (severe.length < 2) return false
  for (let i = 0; i < severe.length; i++) {
    for (let j = i + 1; j < severe.length; j++) {
      const diffMs =
        Math.abs(new Date(severe[j].timestamp).getTime() - new Date(severe[i].timestamp).getTime())
      if (diffMs >= 4 * 60 * 60 * 1000) return true
    }
  }
  return false
}

const plugin: ModulePlugin = {
  meta: {
    id: 'preeclampsia-tracker',
    name: 'Preeclampsia Tracker',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'BP log, severe-range detection, severe features checklist, and mag drip tracker per ACOG 2020.',
    tags: ['obgyn', 'preeclampsia', 'obstetrics', 'hypertension'],
    pack: 'obgyn',
  },
  schema: {
    config: {},
    data: {
      type: 'object',
      properties: {
        bpLog: { type: 'array' },
        proteinuria: { type: 'boolean' },
        severeFeatures: { type: 'object' },
        magDrip: { type: 'object' },
      },
    },
  },
  defaultConfig: {},
  minSize: { w: 4, h: 6 },
  Renderer,
  Editor,
  PrintView,
}

pluginRegistry.register(plugin)
export default plugin
