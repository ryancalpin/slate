import { useState, useEffect, useCallback } from 'react'
import { templateStore } from '../core/storage/templateStore'
import { touchTemplate } from '../core/template/utils'
import { shouldCreateSnapshot, createSnapshot } from '../core/snapshot/snapshotEngine'
import type { Template } from '../core/template/types'

export function useTemplate(id: string | null) {
  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) { setTemplate(null); return }
    setLoading(true)
    templateStore.get(id).then(t => {
      setTemplate(t ?? null)
      setLoading(false)
    })
  }, [id])

  // Auto-snapshot: create a daily snapshot when loading a template from a previous day
  useEffect(() => {
    if (!template) return
    if (!shouldCreateSnapshot(template)) return

    const snapshotRaw = createSnapshot(template, null)
    // Cast to Snapshot — snapshotEngine uses an extended type; stored snapshots use the base type
    const snapshot = { ...snapshotRaw, slotId: snapshotRaw.slotId ?? undefined } as unknown as Template['snapshots'][number]
    const updated: Template = {
      ...template,
      snapshots: [...(template.snapshots ?? []), snapshot],
      updatedAt: new Date().toISOString(),
    }
    templateStore.save(updated).then(() => {
      setTemplate(updated)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.id])

  const saveTemplate = useCallback(async (updated: Template) => {
    const stamped = touchTemplate(updated)
    await templateStore.save(stamped)
    setTemplate(stamped)
  }, [])

  return { template, loading, saveTemplate }
}
