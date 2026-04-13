// src/modules/lines-tubes/lines-tubes.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import linesTubesPlugin from './index'

const noop = () => {}

describe('lines-tubes Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="test"
        config={linesTubesPlugin.defaultConfig}
        data={{ lines: [] }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('+ Add Line')).toBeDefined()
  })

  it('renders a line row with correct data', () => {
    const insertionDate = '2026-04-08'
    render(
      <Renderer
        instanceId="test"
        config={linesTubesPlugin.defaultConfig}
        data={{
          lines: [
            { id: '1', type: 'PIV', site: 'Right AC', insertionDate },
          ],
        }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('Right AC')).toBeDefined()
  })

  it('shows build mode placeholder in build mode', () => {
    render(
      <Renderer
        instanceId="test"
        config={linesTubesPlugin.defaultConfig}
        data={{ lines: [] }}
        onDataChange={noop}
        mode="build"
      />
    )
    expect(screen.getByText('Lines / Tubes / Drains')).toBeDefined()
  })
})

describe('lines-tubes PrintView', () => {
  it('renders without crashing', () => {
    render(
      <PrintView
        config={linesTubesPlugin.defaultConfig}
        data={{ lines: [{ id: '1', type: 'CVC (PICC)', site: 'Left SC', insertionDate: '2026-04-01' }] }}
      />
    )
    expect(screen.getByText('CVC (PICC)')).toBeDefined()
  })
})
