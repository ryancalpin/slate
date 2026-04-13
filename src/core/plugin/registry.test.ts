import { describe, it, expect, beforeEach } from 'vitest'
import { PluginRegistry } from './registry'
import type { ModulePlugin } from './types'

function makeMockPlugin(id: string): ModulePlugin {
  return {
    meta: { id, name: id, version: '1.0.0', author: 'test', description: '', tags: [] },
    schema: { config: {}, data: {} },
    defaultConfig: {},
    minSize: { w: 2, h: 2 },
    Renderer: () => null,
    Editor: () => null,
    PrintView: () => null,
  }
}

describe('PluginRegistry', () => {
  let registry: PluginRegistry

  beforeEach(() => {
    registry = new PluginRegistry()
  })

  it('registers a plugin and retrieves it by id', () => {
    const plugin = makeMockPlugin('vitals')
    registry.register(plugin)
    expect(registry.get('vitals')).toBe(plugin)
  })

  it('returns undefined for unknown plugin id', () => {
    expect(registry.get('nonexistent')).toBeUndefined()
  })

  it('lists all registered plugins', () => {
    registry.register(makeMockPlugin('vitals'))
    registry.register(makeMockPlugin('labs-panel'))
    expect(registry.list()).toHaveLength(2)
  })

  it('throws if a duplicate id is registered', () => {
    registry.register(makeMockPlugin('vitals'))
    expect(() => registry.register(makeMockPlugin('vitals'))).toThrow('already registered')
  })

  it('filters plugins by tag', () => {
    const plugin = { ...makeMockPlugin('nursing-assessment'), meta: { ...makeMockPlugin('nursing-assessment').meta, tags: ['nursing'] } }
    registry.register(plugin)
    registry.register(makeMockPlugin('vitals'))
    expect(registry.listByTag('nursing')).toHaveLength(1)
    expect(registry.listByTag('nursing')[0].meta.id).toBe('nursing-assessment')
  })

  it('filters plugins by pack', () => {
    const cardioPlugin = { ...makeMockPlugin('gdmt'), meta: { ...makeMockPlugin('gdmt').meta, pack: 'cardiology' } }
    registry.register(cardioPlugin)
    registry.register(makeMockPlugin('vitals'))
    expect(registry.listByPack('cardiology')).toHaveLength(1)
  })
})
