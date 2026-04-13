// src/modules/consults/consults.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import consultsPlugin from './index'

const noop = () => {}
const emptyData = { consults: [], results: [] }

describe('consults Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="test"
        config={consultsPlugin.defaultConfig}
        data={emptyData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('Active Consults')).toBeDefined()
    expect(screen.getByText('Pending Results')).toBeDefined()
  })

  it('renders a consult row', () => {
    render(
      <Renderer
        instanceId="test"
        config={consultsPlugin.defaultConfig}
        data={{
          consults: [{ id: '1', service: 'Cardiology', question: 'Afib mgmt', status: 'Pending', response: '' }],
          results: [],
        }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('Cardiology')).toBeDefined()
  })
})

describe('consults PrintView', () => {
  it('renders without crashing', () => {
    render(
      <PrintView
        config={consultsPlugin.defaultConfig}
        data={{
          consults: [{ id: '1', service: 'Nephrology', question: 'AKI', status: 'Responded', response: 'Hold diuretics' }],
          results: [{ id: '1', description: 'CT chest', status: 'Pending' }],
        }}
      />
    )
    expect(screen.getByText('Nephrology')).toBeDefined()
    expect(screen.getByText('CT chest')).toBeDefined()
  })
})
