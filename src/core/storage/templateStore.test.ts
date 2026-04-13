import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { templateStore } from './templateStore'
import { createTemplate } from '../template/utils'

// Dexie uses IndexedDB — fake-indexeddb provides a compatible in-memory implementation
beforeEach(async () => {
  await templateStore.clear()
})

describe('templateStore', () => {
  it('saves and retrieves a template by id', async () => {
    const t = createTemplate('ICU Rounding')
    await templateStore.save(t)
    const retrieved = await templateStore.get(t.id)
    expect(retrieved?.name).toBe('ICU Rounding')
  })

  it('lists all saved templates', async () => {
    await templateStore.save(createTemplate('Template A'))
    await templateStore.save(createTemplate('Template B'))
    const all = await templateStore.list()
    expect(all).toHaveLength(2)
  })

  it('deletes a template by id', async () => {
    const t = createTemplate('Delete Me')
    await templateStore.save(t)
    await templateStore.delete(t.id)
    const retrieved = await templateStore.get(t.id)
    expect(retrieved).toBeUndefined()
  })

  it('duplicates a template with a new id and name suffix', async () => {
    const t = createTemplate('Original')
    await templateStore.save(t)
    const copy = await templateStore.duplicate(t.id)
    expect(copy.id).not.toBe(t.id)
    expect(copy.name).toBe('Original (copy)')
    const all = await templateStore.list()
    expect(all).toHaveLength(2)
  })

  it('updates an existing template', async () => {
    const t = createTemplate('Old Name')
    await templateStore.save(t)
    await templateStore.save({ ...t, name: 'New Name' })
    const retrieved = await templateStore.get(t.id)
    expect(retrieved?.name).toBe('New Name')
  })
})
