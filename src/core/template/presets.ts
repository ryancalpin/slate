import { v4 as uuid } from 'uuid'
import type { Template, ModuleInstance } from './types'

export interface PresetTemplate {
  id: string
  name: string
  description: string
  icon: string
  specialty: string
  template: Template
}

function mi(
  instanceId: string,
  moduleId: string,
  x: number,
  y: number,
  w: number,
  h: number,
  config: Record<string, unknown> = {},
): ModuleInstance {
  return {
    instanceId,
    moduleId,
    version: '1.0.0',
    position: { x, y, w, h },
    config,
    locked: false,
    collapsed: false,
  }
}

const ICU_MORNING_ROUNDS: Template = {
  id: 'preset-icu',
  name: 'ICU Morning Rounds',
  canvasMode: 'grid',
  patientMode: 'single',
  defaultMode: 'live',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  pages: [
    {
      id: 'page-1',
      name: 'Page 1',
      canvasMode: 'grid',
      layout: [
        mi('ph-1',  'patient-header',      0, 0, 5, 2),
        mi('vit-1', 'vitals',              5, 0, 7, 2),
        mi('ap-1',  'assessment-plan',     0, 2, 6, 4),
        mi('med-1', 'medications',         6, 2, 6, 4),
        mi('lf-1',  'labs-fishbone',       0, 6, 4, 3, { showGlucose: true, showCBC: true, showMgPhos: true }),
        mi('sa-1',  'sofa-apache',         4, 6, 4, 3),
        mi('vp-1',  'vasopressor-tracker', 8, 6, 4, 3),
        mi('vs-1',  'vent-settings',       0, 9, 4, 3),
        mi('sd-1',  'sedation-tracker',    4, 9, 4, 3),
        mi('sp-1',  'sepsis-tracker',      8, 9, 4, 3),
      ],
    },
  ],
  patientSlots: [],
  singleData: {},
  snapshots: [],
}

const GENERAL_MEDICINE_ROUNDS: Template = {
  id: 'preset-general-medicine',
  name: 'General Medicine Rounds',
  canvasMode: 'grid',
  patientMode: 'single',
  defaultMode: 'live',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  pages: [
    {
      id: 'page-1',
      name: 'Page 1',
      canvasMode: 'grid',
      layout: [
        mi('ph-1',  'patient-header',  0, 0, 5, 2),
        mi('vit-1', 'vitals',          5, 0, 7, 2),
        mi('ap-1',  'assessment-plan', 0, 2, 6, 5),
        mi('med-1', 'medications',     6, 2, 6, 4),
        mi('lf-1',  'labs-fishbone',   6, 6, 4, 3, { showGlucose: true, showCBC: true }),
        mi('con-1', 'consults',        0, 7, 6, 3),
        mi('tc-1',  'task-checklist',  6, 9, 6, 2),
      ],
    },
  ],
  patientSlots: [],
  singleData: {},
  snapshots: [],
}

const OB_ANTEPARTUM: Template = {
  id: 'preset-ob-antepartum',
  name: 'OB / Antepartum',
  canvasMode: 'grid',
  patientMode: 'single',
  defaultMode: 'live',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  pages: [
    {
      id: 'page-1',
      name: 'Page 1',
      canvasMode: 'grid',
      layout: [
        mi('ph-1',  'patient-header',       0, 0, 5, 2),
        mi('vit-1', 'vitals',               5, 0, 7, 2),
        mi('at-1',  'antepartum-tracker',   0, 2, 6, 4),
        mi('pe-1',  'preeclampsia-tracker', 6, 2, 6, 4),
        mi('lf-1',  'labs-fishbone',        0, 6, 5, 3, { showGlucose: true, showCBC: true }),
        mi('ap-1',  'assessment-plan',      5, 6, 7, 3),
        mi('med-1', 'medications',          0, 9, 6, 3),
      ],
    },
  ],
  patientSlots: [],
  singleData: {},
  snapshots: [],
}

const NEUROLOGY_STROKE: Template = {
  id: 'preset-neurology-stroke',
  name: 'Neurology / Stroke',
  canvasMode: 'grid',
  patientMode: 'single',
  defaultMode: 'live',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  pages: [
    {
      id: 'page-1',
      name: 'Page 1',
      canvasMode: 'grid',
      layout: [
        mi('ph-1',  'patient-header',  0, 0, 5, 2),
        mi('vit-1', 'vitals',          5, 0, 7, 2),
        mi('ni-1',  'nihss',           0, 2, 6, 4),
        mi('st-1',  'stroke-timeline', 6, 2, 6, 4),
        mi('ns-1',  'neuro-scores',    0, 6, 4, 3),
        mi('med-1', 'medications',     4, 6, 4, 3),
        mi('ap-1',  'assessment-plan', 8, 6, 4, 4),
        mi('lf-1',  'labs-fishbone',   0, 9, 5, 3, { showGlucose: true, showCBC: true }),
      ],
    },
  ],
  patientSlots: [],
  singleData: {},
  snapshots: [],
}

const PEDIATRICS: Template = {
  id: 'preset-pediatrics',
  name: 'Pediatrics',
  canvasMode: 'grid',
  patientMode: 'single',
  defaultMode: 'live',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  pages: [
    {
      id: 'page-1',
      name: 'Page 1',
      canvasMode: 'grid',
      layout: [
        mi('ph-1',  'patient-header',     0,  0, 5, 2),
        mi('vit-1', 'vitals',             5,  0, 7, 2),
        mi('wd-1',  'weight-based-dosing', 0, 2, 5, 4),
        mi('med-1', 'medications',        5,  2, 7, 4),
        mi('ap-1',  'assessment-plan',    0,  6, 6, 4),
        mi('lf-1',  'labs-fishbone',      6,  6, 6, 3, { showGlucose: true, showCBC: true }),
        mi('tc-1',  'task-checklist',     0, 10, 6, 2),
      ],
    },
  ],
  patientSlots: [],
  singleData: {},
  snapshots: [],
}

export const PRESETS: PresetTemplate[] = [
  {
    id: 'preset-icu',
    name: 'ICU Morning Rounds',
    description: 'Full ICU rounding view with vitals, vents, vasopressors, sedation, and SOFA scoring.',
    icon: '🏥',
    specialty: 'ICU',
    template: ICU_MORNING_ROUNDS,
  },
  {
    id: 'preset-general-medicine',
    name: 'General Medicine Rounds',
    description: 'Standard med/surg rounding layout with A&P, medications, labs, and consults.',
    icon: '🩺',
    specialty: 'General Medicine',
    template: GENERAL_MEDICINE_ROUNDS,
  },
  {
    id: 'preset-ob-antepartum',
    name: 'OB / Antepartum',
    description: 'Antepartum monitoring with preeclampsia tracking, labs, and medication management.',
    icon: '🤰',
    specialty: 'OB/GYN',
    template: OB_ANTEPARTUM,
  },
  {
    id: 'preset-neurology-stroke',
    name: 'Neurology / Stroke',
    description: 'Stroke protocol layout with NIHSS scoring, timeline, neuro scores, and medications.',
    icon: '🧠',
    specialty: 'Neurology',
    template: NEUROLOGY_STROKE,
  },
  {
    id: 'preset-pediatrics',
    name: 'Pediatrics',
    description: 'Peds rounding with weight-based dosing, A&P, labs, and task checklist.',
    icon: '👶',
    specialty: 'Pediatrics',
    template: PEDIATRICS,
  },
]

export function clonePreset(preset: PresetTemplate): Template {
  const now = new Date().toISOString()
  const cloned = structuredClone(preset.template)

  cloned.id = uuid()
  cloned.createdAt = now
  cloned.updatedAt = now

  for (const page of cloned.pages) {
    page.id = uuid()
    for (const instance of page.layout) {
      instance.instanceId = uuid()
    }
  }

  return cloned
}
