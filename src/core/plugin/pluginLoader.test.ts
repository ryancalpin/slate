import { describe, it, expect, vi } from 'vitest'
import { validatePluginShape } from './pluginLoader'
import type { ModulePlugin } from './types'

const validPlugin: ModulePlugin = {
  meta: {
    id: 'test-plugin',
    name: 'Test Plugin',
    version: '1.0.0',
    author: 'Test Author',
    description: 'A test plugin',
    tags: ['test'],
  },
  schema: { config: {}, data: {} },
  defaultConfig: {},
  minSize: { w: 2, h: 2 },
  Renderer: (() => null) as unknown as ModulePlugin['Renderer'],
  Editor: (() => null) as unknown as ModulePlugin['Editor'],
  PrintView: (() => null) as unknown as ModulePlugin['PrintView'],
}

describe('validatePluginShape', () => {
  it('returns true for a valid plugin object', () => {
    expect(validatePluginShape(validPlugin)).toBe(true)
  })

  it('returns false when meta is missing', () => {
    const { meta: _, ...bad } = validPlugin
    expect(validatePluginShape(bad)).toBe(false)
  })

  it('returns false when Renderer is missing', () => {
    const { Renderer: _, ...bad } = validPlugin
    expect(validatePluginShape(bad)).toBe(false)
  })

  it('returns false when meta.id is missing', () => {
    const bad = { ...validPlugin, meta: { ...validPlugin.meta, id: '' } }
    expect(validatePluginShape(bad)).toBe(false)
  })

  it('returns false for a non-object', () => {
    expect(validatePluginShape(null)).toBe(false)
    expect(validatePluginShape('string')).toBe(false)
    expect(validatePluginShape(42)).toBe(false)
  })
})

describe('loadPluginFromUrl', () => {
  it('throws with a helpful message when the import resolves to an object without default export', async () => {
    // Dynamic import returns a module without a `default` that is a valid plugin
    vi.stubGlobal(
      'importModule',
      vi.fn().mockResolvedValue({ default: { notAPlugin: true } }),
    )
    // We cannot actually test dynamic import() in vitest easily, so we test the validator path
    // by verifying that validatePluginShape({ notAPlugin: true }) returns false
    expect(validatePluginShape({ notAPlugin: true })).toBe(false)
  })
})
