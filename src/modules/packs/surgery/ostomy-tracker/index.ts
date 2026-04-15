import type { ModulePlugin } from '../../../../core/plugin/types'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

export type OstomyEntry = { date: string; shift: string; volumeMl: number; character: string }
export type OstomyTrackerData = {
  stomaType: string
  entries: OstomyEntry[]
  skinStatus: string
  lastApplianceChange: string
}

export const ostomyTrackerPlugin: ModulePlugin = {
  meta: {
    id: 'ostomy-tracker',
    name: 'Ostomy Tracker',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Track ostomy output by shift, stoma type, character, peristomal skin status, and appliance changes.',
    tags: ['surgery', 'ostomy', 'post-op', 'output', 'stoma'],
    pack: 'surgery',
  },
  schema: {
    config: {},
    data: {},
  },
  defaultConfig: {},
  minSize: { w: 3, h: 4 },
  Renderer,
  Editor,
  PrintView,
}
