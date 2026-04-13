// src/modules/nursing-assessment/nursing-assessment.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import nursingPlugin from './index'

const noop = () => {}

const emptyData = {
  systems: {
    Neuro: { status: 'WNL', notes: '' },
    Cardiac: { status: 'WNL', notes: '' },
    Respiratory: { status: 'WNL', notes: '' },
    GI: { status: 'WNL', notes: '' },
    GU: { status: 'WNL', notes: '' },
    'Skin/Wound': { status: 'WNL', notes: '' },
    Mobility: { status: 'WNL', notes: '' },
    'Fall Risk': { status: 'WNL', notes: '', fallScore: 0 },
    Pain: { status: 'WNL', notes: '', painScale: 0, cpot: 0 },
  },
}

describe('nursing-assessment Renderer', () => {
  it('renders without crashing', () => {
    render(
      <Renderer
        instanceId="test"
        config={nursingPlugin.defaultConfig}
        data={emptyData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('Neuro')).toBeDefined()
    expect(screen.getByText('Cardiac')).toBeDefined()
  })

  it('shows WNL status buttons', () => {
    render(
      <Renderer
        instanceId="test"
        config={nursingPlugin.defaultConfig}
        data={emptyData}
        onDataChange={noop}
        mode="live"
      />
    )
    const wnlButtons = screen.getAllByText('WNL')
    expect(wnlButtons.length).toBeGreaterThan(0)
  })
})

describe('nursing-assessment PrintView', () => {
  it('renders without crashing', () => {
    render(
      <PrintView
        config={nursingPlugin.defaultConfig}
        data={emptyData}
      />
    )
    expect(screen.getByText('Nursing Assessment')).toBeDefined()
  })
})
