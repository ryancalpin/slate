import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export type DrainEntry = { date: string; shift: 'day' | 'evening' | 'night'; volumeMl: number }
export type Drain = { name: string; character: string; entries: DrainEntry[] }
export type SurgicalDrainsData = { drains: Drain[]; alertThresholdMl: number }

export function calcDailyDrainTotal(
  entries: Array<{ date: string; volumeMl: number }>,
  date: string
): number {
  return entries.filter(e => e.date === date).reduce((sum, e) => sum + e.volumeMl, 0)
}

export const surgicalDrainsPlugin: ModulePlugin = {
  meta: {
    id: 'surgical-drains',
    name: 'Surgical Drains',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Track up to 4 surgical drains with shift-based output entries, daily totals, and 3-day trend sparklines.',
    tags: ['surgery', 'drains', 'post-op', 'output'],
    pack: 'surgery',
  },
  schema: {
    config: { alertThresholdMl: { type: 'number' } },
    data: {},
  },
  defaultConfig: { alertThresholdMl: 500 },
  minSize: { w: 4, h: 4 },
  Renderer,
  Editor,
  PrintView,
}
