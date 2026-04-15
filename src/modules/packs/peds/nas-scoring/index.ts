import { pluginRegistry } from '../../../../core/plugin/registry'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'
import type { ModulePlugin } from '../../../../core/plugin/types'

export const CITATION = 'Finnegan LP et al. J Perinat Med. 1975;3(2):61-75'

// 25-item Finnegan NAS score
export function calcNAS(items: number[]): number {
  return items.reduce((sum, v) => sum + (v ?? 0), 0)
}

export const NAS_ITEMS: { label: string; options: number[] }[] = [
  { label: 'Crying', options: [0, 2, 3] },
  { label: 'Sleep (<1h=3, 1-2h=2, >2h=1)', options: [0, 1, 2, 3] },
  { label: 'Moro Reflex', options: [0, 2, 3] },
  { label: 'Tremors (disturbed)', options: [0, 1, 2, 3] },
  { label: 'Tremors (undisturbed)', options: [0, 1, 2, 3] },
  { label: 'Increased Muscle Tone', options: [0, 1] },
  { label: 'Excoriation', options: [0, 1] },
  { label: 'Myoclonic Jerks', options: [0, 3] },
  { label: 'Generalized Convulsions', options: [0, 5] },
  { label: 'Sweating', options: [0, 1] },
  { label: 'Hyperthermia 37.2–38.3°C', options: [0, 1] },
  { label: 'Hyperthermia >38.4°C', options: [0, 2] },
  { label: 'Yawning (>3-4×/interval)', options: [0, 1] },
  { label: 'Mottling', options: [0, 1] },
  { label: 'Nasal Stuffiness', options: [0, 1] },
  { label: 'Sneezing (>3-4×/interval)', options: [0, 1] },
  { label: 'Nasal Flaring', options: [0, 2] },
  { label: 'Respiratory Rate >60/min', options: [0, 1] },
  { label: 'Resp Rate >60/min + Retractions', options: [0, 2] },
  { label: 'Excessive Sucking', options: [0, 1] },
  { label: 'Poor Feeding', options: [0, 2] },
  { label: 'Regurgitation', options: [0, 2] },
  { label: 'Projectile Vomiting', options: [0, 3] },
  { label: 'Liquid Stools', options: [0, 2] },
  { label: 'Watery Stools', options: [0, 3] },
]

const plugin: ModulePlugin = {
  meta: {
    id: 'nas-scoring',
    name: 'NAS / Finnegan Scoring',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Full 25-item Finnegan Neonatal Abstinence Syndrome scoring tool with auto-total.',
    tags: ['peds', 'neonatology', 'nas', 'finnegan', 'nicu'],
    pack: 'peds',
  },
  schema: {
    config: {},
    data: {
      type: 'object',
      properties: {
        items: { type: 'array', items: { type: 'number' } },
      },
    },
  },
  defaultConfig: {},
  minSize: { w: 3, h: 6 },
  Renderer,
  Editor,
  PrintView,
}

pluginRegistry.register(plugin)
export default plugin
