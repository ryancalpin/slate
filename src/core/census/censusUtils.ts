import type { Template, PatientSlot } from '../template/types'

export interface VitalsSummary {
  hr?: number
  bp_systolic?: number
  bp_diastolic?: number
  temp?: number
  spo2?: number
}

export interface CensusSummary {
  templateId: string
  templateName: string
  slotId: string
  label: string
  room: string
  admitDate: string
  admitDayNumber: number
  vitals: VitalsSummary
  flaggedAbnormalsCount: number
  pendingTaskCount: number
}

/**
 * Extracts glanceable summary data from each patient slot in a template.
 * Returns one CensusSummary per slot (roster mode) or a single summary
 * for single-instance templates.
 */
export function extractCensusSummary(template: Template): CensusSummary[] {
  const slots: PatientSlot[] =
    template.patientMode === 'roster' && template.patientSlots?.length
      ? (template.patientSlots as PatientSlot[])
      : [
          {
            id: '__single__',
            label: template.name,
            room: '',
            admitDate: template.createdAt.split('T')[0],
            notes: '',
            data: (template.singleData as PatientSlot['data']) ?? {},
          },
        ]

  const allLayouts = (template.pages ?? []).flatMap((p) => p.layout)
  const vitalsInstance = allLayouts.find((l) => l.moduleId === 'vitals')
  const taskInstance = allLayouts.find((l) => l.moduleId === 'task-checklist')

  return slots.map((slot) => {
    const slotData = (slot.data as Record<string, Record<string, unknown>>) ?? {}

    // Vitals
    let vitals: VitalsSummary = {}
    if (vitalsInstance) {
      const vd = slotData[vitalsInstance.instanceId] ?? {}
      vitals = {
        hr: vd['hr'] as number | undefined,
        bp_systolic: vd['bp_systolic'] as number | undefined,
        bp_diastolic: vd['bp_diastolic'] as number | undefined,
        temp: vd['temp'] as number | undefined,
        spo2: vd['spo2'] as number | undefined,
      }
    }

    // Pending tasks
    let pendingTaskCount = 0
    if (taskInstance) {
      const td = slotData[taskInstance.instanceId] ?? {}
      const tasks = (td['tasks'] as Array<{ completed: boolean }> | undefined) ?? []
      pendingTaskCount = tasks.filter((t) => !t.completed).length
    }

    // Admit day number (day 1 = admit date)
    const admitMs = new Date(slot.admitDate).getTime()
    const nowMs = new Date(template.updatedAt).getTime()
    const admitDayNumber = Math.max(1, Math.floor((nowMs - admitMs) / 86_400_000) + 1)

    return {
      templateId: template.id,
      templateName: template.name,
      slotId: slot.id,
      label: slot.label,
      room: slot.room,
      admitDate: slot.admitDate,
      admitDayNumber,
      vitals,
      flaggedAbnormalsCount: 0,
      pendingTaskCount,
    }
  })
}
