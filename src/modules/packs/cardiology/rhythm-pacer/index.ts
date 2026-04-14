import type { ModulePlugin } from '../../../../core/plugin/types'
import Renderer from './Renderer'
import Editor from './Editor'
import PrintView from './PrintView'

export const RHYTHM_OPTIONS = [
  'NSR', 'AF', 'Atrial Flutter', 'SVT', 'VT', 'VF',
  'AV Block 1°', 'AV Block 2° Mobitz I', 'AV Block 2° Mobitz II', 'AV Block 3°', 'Paced',
]

export const CHADS_ITEMS: { key: string; label: string; points: number }[] = [
  { key: 'chf',          label: 'CHF / LV dysfunction',          points: 1 },
  { key: 'hypertension', label: 'Hypertension',                   points: 1 },
  { key: 'age75',        label: 'Age ≥ 75',                       points: 2 },
  { key: 'diabetes',     label: 'Diabetes mellitus',              points: 1 },
  { key: 'stroke',       label: 'Stroke / TIA / Thromboembolism', points: 2 },
  { key: 'vascular',     label: 'Vascular disease',               points: 1 },
  { key: 'age6574',      label: 'Age 65–74',                      points: 1 },
  { key: 'female',       label: 'Female sex category',            points: 1 },
]

export const HASBLED_ITEMS: { key: string; label: string; points: number }[] = [
  { key: 'hypertension',      label: 'Hypertension (uncontrolled, SBP > 160)',    points: 1 },
  { key: 'renalDysfunction',  label: 'Renal dysfunction',                         points: 1 },
  { key: 'liverDysfunction',  label: 'Liver dysfunction',                         points: 1 },
  { key: 'stroke',            label: 'Stroke history',                            points: 1 },
  { key: 'bleeding',          label: 'Bleeding history / predisposition',         points: 1 },
  { key: 'labileInr',         label: 'Labile INR',                               points: 1 },
  { key: 'elderly',           label: 'Elderly (age > 65)',                        points: 1 },
  { key: 'drugs',             label: 'Drugs (antiplatelets / NSAIDs)',            points: 1 },
  { key: 'alcohol',           label: 'Alcohol use',                               points: 1 },
]

export function calcCHADS2VASc(items: Record<string, boolean>): number {
  // age75 (2pts) and age6574 (1pt) are mutually exclusive — age75 takes priority
  const effectiveItems = { ...items }
  if (effectiveItems.age75) effectiveItems.age6574 = false
  return CHADS_ITEMS.reduce((sum, item) => sum + (effectiveItems[item.key] ? item.points : 0), 0)
}

export function calcHASBLED(items: Record<string, boolean>): number {
  return HASBLED_ITEMS.reduce((sum, item) => sum + (items[item.key] ? item.points : 0), 0)
}

const RhythmPacerPlugin: ModulePlugin = {
  meta: {
    id: 'rhythm-pacer',
    name: 'Rhythm & Pacemaker',
    version: '1.0.0',
    author: 'patient-templates',
    description: 'Rhythm documentation, pacemaker settings (conditional), CHADS₂-VASc, and HAS-BLED scoring.',
    tags: ['cardiology', 'rhythm', 'pacemaker', 'afib', 'anticoagulation'],
    pack: 'cardiology',
  },
  schema: {
    config: { type: 'object', properties: { title: { type: 'string' } } },
    data: {
      type: 'object',
      properties: {
        rhythm:       { type: 'string' },
        pacer:        { type: 'object' },
        chadsItems:   { type: 'object' },
        hasbledItems: { type: 'object' },
      },
    },
  },
  defaultConfig: { title: 'Rhythm & Pacemaker' },
  minSize: { w: 3, h: 5 },
  Renderer,
  Editor,
  PrintView,
}

export default RhythmPacerPlugin
