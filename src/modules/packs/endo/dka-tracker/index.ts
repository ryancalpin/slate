import { FC } from 'react'
import { DKATrackerRenderer } from './Renderer'
import { DKATrackerEditor } from './Editor'
import { DKATrackerPrintView } from './PrintView'
import type { ModulePlugin } from '../../../../core/plugin/types'
import { pluginRegistry } from '../../../../core/plugin/registry'

export const CITATION =
  'Kitabchi AE et al. Diabetes Care. 2009;32(7):1335-1343'

export function calcAnionGap(na: number, cl: number, hco3: number): number {
  return na - cl - hco3
}

export function isDKAClosed(
  ag: number,
  hco3: number,
  glucose: number,
  eatingPO: boolean
): boolean {
  return ag < 12 && hco3 >= 18 && glucose < 200 && eatingPO
}

const dkaTracker: ModulePlugin = {
  meta: {
    id: 'dka-tracker',
    name: 'DKA Tracker',
    version: '1.0.0',
    author: 'Endo Pack',
    description: 'DKA trend table with anion gap and evidence-based closure criteria checker.',
    tags: ['DKA', 'diabetes', 'anion gap', 'endocrinology', 'ICU'],
    pack: 'endo',
  },
  schema: {
    config: {},
    data: {
      entries: 'array',
      patientEating: 'boolean',
    },
  },
  defaultConfig: {},
  minSize: { w: 4, h: 5 },
  Renderer: DKATrackerRenderer as FC<any>,
  Editor: DKATrackerEditor as FC<any>,
  PrintView: DKATrackerPrintView as FC<any>,
}

pluginRegistry.register(dkaTracker)

export default dkaTracker
