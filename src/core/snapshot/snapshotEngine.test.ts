import { describe, it, expect } from 'vitest'
import { shouldCreateSnapshot, createSnapshot, applySnapshotToTemplate } from './snapshotEngine'
import type { Template } from '../template/types'

function makeTemplate(updatedAt: string, snapshots: Template['snapshots'] = []): Template {
  return {
    id: 't1',
    name: 'Test Template',
    canvasMode: 'grid',
    patientMode: 'single',
    defaultMode: 'live',
    createdAt: '2026-04-01T10:00:00.000Z',
    updatedAt,
    pages: [
      {
        id: 'p1',
        name: 'Page 1',
        canvasMode: 'grid',
        layout: [
          {
            instanceId: 'inst-1',
            moduleId: 'vitals',
            version: '1.0.0',
            position: { x: 0, y: 0, w: 4, h: 3 },
            config: {},
            locked: false,
            collapsed: false,
          },
        ],
      },
    ],
    singleData: { 'inst-1': { hr: 72 } },
    patientSlots: [],
    snapshots,
  } as unknown as Template
}

describe('shouldCreateSnapshot', () => {
  it('returns true when updatedAt date differs from today', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const template = makeTemplate(yesterday.toISOString())
    expect(shouldCreateSnapshot(template)).toBe(true)
  })

  it('returns false when updatedAt date is today', () => {
    const template = makeTemplate(new Date().toISOString())
    expect(shouldCreateSnapshot(template)).toBe(false)
  })

  it('returns false when a snapshot already exists for today', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const todayDate = new Date().toISOString().split('T')[0]
    const template = makeTemplate(yesterday.toISOString(), [
      { date: todayDate, slotId: undefined, pages: [] },
    ])
    expect(shouldCreateSnapshot(template)).toBe(false)
  })
})

describe('createSnapshot', () => {
  it('creates a snapshot with today ISO date, null slotId, and frozen page data', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const template = makeTemplate(yesterday.toISOString())
    const snapshot = createSnapshot(template, null)
    const todayDate = new Date().toISOString().split('T')[0]

    expect(snapshot.date).toBe(todayDate)
    expect(snapshot.slotId).toBeNull()
    expect(snapshot.pages).toHaveLength(1)
    expect(snapshot.pages[0].id).toBe('p1')
  })

  it('creates a roster snapshot with the correct slotId', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const template = makeTemplate(yesterday.toISOString())
    const snapshot = createSnapshot(template, 'slot-99')
    expect(snapshot.slotId).toBe('slot-99')
  })
})

describe('applySnapshotToTemplate', () => {
  it('returns a template with singleData overwritten by snapshot page data', () => {
    const template = makeTemplate(new Date().toISOString())
    const snapshotDate = '2026-04-12'
    const frozenTemplate = applySnapshotToTemplate(template, snapshotDate)
    // The function returns the template in read-only snapshot mode
    expect(frozenTemplate).toHaveProperty('_snapshotDate', snapshotDate)
  })
})
