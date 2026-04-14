import type { Template, TemplatePage } from '../template/types'

// Extended snapshot type that allows explicit null slotId
export interface SnapshotWithNull {
  date: string
  slotId: string | null
  pages: Array<TemplatePage & { snapshotData?: Record<string, unknown> }>
}

/**
 * Returns true if the template was last updated on a date prior to today
 * AND no snapshot already exists for today's date.
 */
export function shouldCreateSnapshot(template: Template): boolean {
  const todayDate = new Date().toISOString().split('T')[0]
  const updatedDate = new Date(template.updatedAt).toISOString().split('T')[0]

  if (updatedDate === todayDate) return false

  const alreadyExists = template.snapshots?.some((s) => s.date === todayDate) ?? false
  return !alreadyExists
}

/**
 * Creates a frozen snapshot of the current page layouts and data.
 * The snapshot captures all pages with their layouts deep-cloned.
 *
 * @param template - The template to snapshot
 * @param slotId - For roster mode, the patient slot ID; null for single mode
 */
export function createSnapshot(template: Template, slotId: string | null): SnapshotWithNull {
  const todayDate = new Date().toISOString().split('T')[0]

  const frozenPages = (template.pages as TemplatePage[]).map((page) => ({
    ...page,
    layout: page.layout.map((inst) => ({
      ...inst,
      config: { ...inst.config },
      position: { ...inst.position },
    })),
    // Attach per-instance data to the frozen page layout
    snapshotData: slotId
      ? { ...(template.patientSlots?.find((s) => s.id === slotId)?.data ?? {}) }
      : { ...(template.singleData ?? {}) },
  }))

  return {
    date: todayDate,
    slotId,
    pages: frozenPages,
  }
}

/**
 * Returns a read-only view of the template with data replaced by the
 * specified snapshot's frozen data. Adds a `_snapshotDate` marker so
 * the UI can show a "viewing snapshot" banner.
 */
export function applySnapshotToTemplate(
  template: Template,
  snapshotDate: string,
): Template & { _snapshotDate: string } {
  const snapshot = template.snapshots?.find((s) => s.date === snapshotDate) as
    | (SnapshotWithNull & { pages: TemplatePage[] })
    | undefined

  if (!snapshot) {
    return { ...template, _snapshotDate: snapshotDate }
  }

  // Rebuild singleData from snapshot pages' snapshotData
  const restoredData: Record<string, unknown> = {}
  for (const page of snapshot.pages as Array<TemplatePage & { snapshotData?: Record<string, unknown> }>) {
    if (page.snapshotData) {
      Object.assign(restoredData, page.snapshotData)
    }
  }

  return {
    ...template,
    pages: snapshot.pages as TemplatePage[],
    singleData: restoredData as Template['singleData'],
    _snapshotDate: snapshotDate,
  }
}
