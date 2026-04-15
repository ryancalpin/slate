import { describe, it, expect } from 'vitest'
import { pluginRegistry } from '../../core/plugin/registry'
import './index'

describe('specialty packs registration', () => {
it('registers all 12 specialty packs', () => {
  const packIds = new Set(pluginRegistry.list().map(p => p.meta.pack).filter(Boolean))
  expect(packIds).toContain('cardiology')
  expect(packIds).toContain('pulm')
  expect(packIds).toContain('nephro')
  expect(packIds).toContain('neuro')
  expect(packIds).toContain('id')
  expect(packIds).toContain('icu')
  expect(packIds).toContain('hemonc')
  expect(packIds).toContain('gi')
  expect(packIds).toContain('endo')
  expect(packIds).toContain('surgery')
  expect(packIds).toContain('obgyn')
  expect(packIds).toContain('peds')
})
})
