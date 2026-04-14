import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePatientSlot } from './usePatientSlot'
import type { Template } from '../core/template/types'

const mockSave = vi.fn()
vi.mock('../core/storage/templateStore', () => ({
  templateStore: { save: (...args: unknown[]) => mockSave(...args) },
}))

function makeRosterTemplate(): Template {
  return {
    id: 't1',
    name: 'Roster',
    canvasMode: 'grid',
    patientMode: 'roster',
    defaultMode: 'live',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-13T00:00:00.000Z',
    pages: [],
    patientSlots: [
      { id: 'slot-a', label: 'Jones, M', room: '2B', admitDate: '2026-04-10', notes: '', data: { 'inst-1': { hr: 80 } } },
      { id: 'slot-b', label: 'Lee, K', room: '3C', admitDate: '2026-04-11', notes: '', data: { 'inst-1': { hr: 60 } } },
    ],
    singleData: {},
    snapshots: [],
  } as unknown as Template
}

describe('usePatientSlot', () => {
  beforeEach(() => {
    mockSave.mockResolvedValue(undefined)
  })

  it('defaults to first slot', () => {
    const template = makeRosterTemplate()
    const { result } = renderHook(() => usePatientSlot(template, vi.fn()))
    expect(result.current.activeSlotId).toBe('slot-a')
  })

  it('switching slots changes activeSlotId', () => {
    const template = makeRosterTemplate()
    const { result } = renderHook(() => usePatientSlot(template, vi.fn()))
    act(() => { result.current.setActiveSlotId('slot-b') })
    expect(result.current.activeSlotId).toBe('slot-b')
  })

  it('getData returns data for the active slot', () => {
    const template = makeRosterTemplate()
    const { result } = renderHook(() => usePatientSlot(template, vi.fn()))
    const data = result.current.getData('inst-1')
    expect(data).toEqual({ hr: 80 })
  })

  it('getData returns different data after slot switch', () => {
    const template = makeRosterTemplate()
    const { result } = renderHook(() => usePatientSlot(template, vi.fn()))
    act(() => { result.current.setActiveSlotId('slot-b') })
    const data = result.current.getData('inst-1')
    expect(data).toEqual({ hr: 60 })
  })

  it('addSlot creates a new slot with empty data and saves', async () => {
    const template = makeRosterTemplate()
    const onUpdate = vi.fn()
    const { result } = renderHook(() => usePatientSlot(template, onUpdate))
    await act(async () => {
      await result.current.addSlot({ label: 'New Patient', room: '5D' })
    })
    expect(mockSave).toHaveBeenCalledOnce()
    const savedTemplate = mockSave.mock.calls[0][0] as Template
    expect(savedTemplate.patientSlots).toHaveLength(3)
    expect(savedTemplate.patientSlots?.[2].label).toBe('New Patient')
    expect(savedTemplate.patientSlots?.[2].room).toBe('5D')
  })
})
