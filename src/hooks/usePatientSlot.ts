import { useState, useCallback } from 'react'
import type { Template, PatientSlot } from '../core/template/types'
import { templateStore } from '../core/storage/templateStore'

interface AddSlotOptions {
  label: string
  room: string
}

interface UsePatientSlotReturn {
  activeSlotId: string | null
  setActiveSlotId: (id: string) => void
  activeSlot: PatientSlot | null
  getData: (instanceId: string) => Record<string, unknown>
  setData: (instanceId: string, data: Record<string, unknown>) => Promise<void>
  addSlot: (options: AddSlotOptions) => Promise<void>
  removeSlot: (slotId: string) => Promise<void>
  renameSlot: (slotId: string, label: string, room: string) => Promise<void>
}

/**
 * Manages patient slot selection and per-slot data reads/writes for
 * roster-mode templates. Falls back to null / singleData for single mode.
 */
export function usePatientSlot(
  template: Template | null,
  onUpdate: (updated: Template) => void,
): UsePatientSlotReturn {
  const firstSlotId = template?.patientSlots?.[0]?.id ?? null
  const [activeSlotId, setActiveSlotId] = useState<string | null>(firstSlotId)

  const activeSlot: PatientSlot | null =
    template?.patientSlots?.find((s) => s.id === activeSlotId) ?? null

  const getData = useCallback(
    (instanceId: string): Record<string, unknown> => {
      if (!template) return {}
      if (template.patientMode === 'roster' && activeSlot) {
        return (activeSlot.data?.[instanceId] as Record<string, unknown>) ?? {}
      }
      return (template.singleData?.[instanceId] as Record<string, unknown>) ?? {}
    },
    [template, activeSlot],
  )

  const setData = useCallback(
    async (instanceId: string, data: Record<string, unknown>): Promise<void> => {
      if (!template) return

      let updated: Template
      if (template.patientMode === 'roster' && activeSlotId) {
        const slots = (template.patientSlots ?? []).map((s) =>
          s.id === activeSlotId
            ? { ...s, data: { ...s.data, [instanceId]: data } }
            : s,
        )
        updated = { ...template, patientSlots: slots, updatedAt: new Date().toISOString() }
      } else {
        updated = {
          ...template,
          singleData: { ...template.singleData, [instanceId]: data },
          updatedAt: new Date().toISOString(),
        }
      }

      await templateStore.save(updated)
      onUpdate(updated)
    },
    [template, activeSlotId, onUpdate],
  )

  const addSlot = useCallback(
    async ({ label, room }: AddSlotOptions): Promise<void> => {
      if (!template) return
      const newSlot: PatientSlot = {
        id: `slot-${Date.now()}`,
        label,
        room,
        admitDate: new Date().toISOString().split('T')[0],
        notes: '',
        data: {},
      }
      const updated: Template = {
        ...template,
        patientSlots: [...(template.patientSlots ?? []), newSlot],
        updatedAt: new Date().toISOString(),
      }
      await templateStore.save(updated)
      onUpdate(updated)
      setActiveSlotId(newSlot.id)
    },
    [template, onUpdate],
  )

  const removeSlot = useCallback(
    async (slotId: string): Promise<void> => {
      if (!template) return
      const slots = (template.patientSlots ?? []).filter((s) => s.id !== slotId)
      const updated: Template = {
        ...template,
        patientSlots: slots,
        updatedAt: new Date().toISOString(),
      }
      await templateStore.save(updated)
      onUpdate(updated)
      if (activeSlotId === slotId) {
        setActiveSlotId(slots[0]?.id ?? null)
      }
    },
    [template, activeSlotId, onUpdate],
  )

  const renameSlot = useCallback(
    async (slotId: string, label: string, room: string): Promise<void> => {
      if (!template) return
      const slots = (template.patientSlots ?? []).map((s) =>
        s.id === slotId ? { ...s, label, room } : s,
      )
      const updated: Template = {
        ...template,
        patientSlots: slots,
        updatedAt: new Date().toISOString(),
      }
      await templateStore.save(updated)
      onUpdate(updated)
    },
    [template, onUpdate],
  )

  return {
    activeSlotId,
    setActiveSlotId,
    activeSlot,
    getData,
    setData,
    addSlot,
    removeSlot,
    renameSlot,
  }
}
