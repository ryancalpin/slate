import { describe, it, expect } from 'vitest'
import { extractCensusSummary } from './censusUtils'
import type { Template } from '../template/types'

function makeRosterTemplate(overrides: Partial<Template> = {}): Template {
  return {
    id: 't1',
    name: 'ICU Roster',
    canvasMode: 'grid',
    patientMode: 'roster',
    defaultMode: 'live',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-13T00:00:00.000Z',
    pages: [
      {
        id: 'p1',
        name: 'Page 1',
        canvasMode: 'grid',
        layout: [
          {
            instanceId: 'vitals-1',
            moduleId: 'vitals',
            version: '1.0.0',
            position: { x: 0, y: 0, w: 4, h: 3 },
            config: {},
            locked: false,
            collapsed: false,
          },
          {
            instanceId: 'tasks-1',
            moduleId: 'task-checklist',
            version: '1.0.0',
            position: { x: 4, y: 0, w: 4, h: 3 },
            config: {},
            locked: false,
            collapsed: false,
          },
        ],
      },
    ],
    patientSlots: [
      {
        id: 'slot-1',
        label: 'Smith, J',
        room: '4A',
        admitDate: '2026-04-10',
        notes: '',
        data: {
          'vitals-1': { hr: 110, bp_systolic: 90, bp_diastolic: 60, temp: 38.9, spo2: 94 },
          'tasks-1': {
            tasks: [
              { id: 'task-a', text: 'Order echo', completed: false },
              { id: 'task-b', text: 'Check cultures', completed: true },
            ],
          },
        },
      },
    ],
    singleData: {},
    snapshots: [],
    ...overrides,
  } as unknown as Template
}

describe('extractCensusSummary', () => {
  it('extracts patient label, room, and template name', () => {
    const template = makeRosterTemplate()
    const summaries = extractCensusSummary(template)
    expect(summaries).toHaveLength(1)
    expect(summaries[0].label).toBe('Smith, J')
    expect(summaries[0].room).toBe('4A')
    expect(summaries[0].templateName).toBe('ICU Roster')
  })

  it('extracts HR, BP, Temp, and SpO2 when vitals module is present', () => {
    const template = makeRosterTemplate()
    const summaries = extractCensusSummary(template)
    expect(summaries[0].vitals.hr).toBe(110)
    expect(summaries[0].vitals.bp_systolic).toBe(90)
    expect(summaries[0].vitals.temp).toBe(38.9)
    expect(summaries[0].vitals.spo2).toBe(94)
  })

  it('counts pending tasks correctly', () => {
    const template = makeRosterTemplate()
    const summaries = extractCensusSummary(template)
    expect(summaries[0].pendingTaskCount).toBe(1) // only one incomplete task
  })

  it('calculates admit day number from admitDate', () => {
    const template = makeRosterTemplate()
    const summaries = extractCensusSummary(template)
    // admitDate is 2026-04-10, updatedAt is 2026-04-13 → day 4
    expect(summaries[0].admitDayNumber).toBe(4)
  })

  it('returns empty vitals when no vitals module is in layout', () => {
    const template = makeRosterTemplate()
    // Remove vitals from layout
    ;(template.pages[0].layout as unknown[]).splice(0, 1)
    const summaries = extractCensusSummary(template)
    expect(summaries[0].vitals).toEqual({})
  })
})
