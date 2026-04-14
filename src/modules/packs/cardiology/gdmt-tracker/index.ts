import type { ModulePlugin } from '../../../../core/plugin/types'
import Renderer from './Renderer'
import Editor from './Editor'
import PrintView from './PrintView'

export function calcPercentTarget(current: number, target: number): number {
  if (target === 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

const GdmtTrackerPlugin: ModulePlugin = {
  meta: {
    id: 'gdmt-tracker',
    name: 'GDMT Tracker',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Guideline-Directed Medical Therapy tracker for HFrEF — 4 drug class rows with dose-to-target tracking.',
    tags: ['cardiology', 'heart-failure', 'hfref', 'medications'],
    pack: 'cardiology',
  },
  schema: {
    config: {
      type: 'object',
      properties: {
        title: { type: 'string' },
      },
    },
    data: {
      type: 'object',
      properties: {
        betaBlocker: { type: 'object' },
        aceArb:      { type: 'object' },
        mra:         { type: 'object' },
        sglt2i:      { type: 'object' },
      },
    },
  },
  defaultConfig: {
    title: 'GDMT Tracker',
  },
  minSize: { w: 4, h: 4 },
  Renderer,
  Editor,
  PrintView,
}

export default GdmtTrackerPlugin
