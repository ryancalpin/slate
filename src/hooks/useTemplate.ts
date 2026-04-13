import { useState, useEffect, useCallback } from 'react'
import { templateStore } from '../core/storage/templateStore'
import { touchTemplate } from '../core/template/utils'
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

  const saveTemplate = useCallback(async (updated: Template) => {
    const stamped = touchTemplate(updated)
    await templateStore.save(stamped)
    setTemplate(stamped)
  }, [])

  return { template, loading, saveTemplate }
}
