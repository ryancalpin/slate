import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GridCanvas } from './GridCanvas'
import { pluginRegistry } from '../core/plugin/registry'
import { createPage, createModuleInstance } from '../core/template/utils'
import type { ModulePlugin } from '../core/plugin/types'

const mockPlugin: ModulePlugin = {
  meta: { id: 'test-module', name: 'Test Module', version: '1.0.0', author: 'test', description: '', tags: [] },
  schema: { config: {}, data: {} },
  defaultConfig: {},
  minSize: { w: 2, h: 2 },
  Renderer: ({ data }) => <div data-testid="renderer">rendered: {JSON.stringify(data)}</div>,
  Editor: () => <div>editor</div>,
  PrintView: () => <div>print</div>,
}

// Register once
if (!pluginRegistry.get('test-module')) pluginRegistry.register(mockPlugin)

describe('GridCanvas', () => {
  it('renders module instances on the canvas', () => {
    const instance = createModuleInstance('test-module', '1.0.0', { x: 0, y: 0, w: 4, h: 3 })
    const page = createPage('Test Page')
    page.layout = [instance]

    render(
      <GridCanvas
        page={page}
        mode="live"
        data={{}}
        onPageChange={vi.fn()}
        onDataChange={vi.fn()}
      />
    )

    expect(screen.getByTestId('renderer')).toBeInTheDocument()
  })

  it('shows module name in header', () => {
    const instance = createModuleInstance('test-module', '1.0.0', { x: 0, y: 0, w: 4, h: 3 })
    const page = createPage('Test Page')
    page.layout = [instance]

    render(
      <GridCanvas
        page={page}
        mode="build"
        data={{}}
        onPageChange={vi.fn()}
        onDataChange={vi.fn()}
      />
    )

    expect(screen.getByText('TEST MODULE')).toBeInTheDocument()
  })
})
