// src/modules/custom-fields/custom-fields.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import customFieldsPlugin from './index'

const noop = () => {}

const config = {
  fields: [
    { id: 'f1', label: 'Admit Weight', type: 'number' },
    { id: 'f2', label: 'On antibiotics', type: 'checkbox' },
    { id: 'f3', label: 'Diet', type: 'dropdown', options: ['NPO', 'Clear', 'Regular'] },
  ],
}

describe('custom-fields Renderer', () => {
  it('renders without crashing with no fields', () => {
    render(
      <Renderer
        instanceId="test"
        config={customFieldsPlugin.defaultConfig}
        data={{ values: {} }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('No fields configured. Open settings to add fields.')).toBeDefined()
  })

  it('renders configured fields', () => {
    render(
      <Renderer
        instanceId="test"
        config={config}
        data={{ values: {} }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('Admit Weight')).toBeDefined()
    expect(screen.getByText('On antibiotics')).toBeDefined()
    expect(screen.getByText('Diet')).toBeDefined()
  })
})

describe('custom-fields PrintView', () => {
  it('renders field values', () => {
    render(
      <PrintView
        config={config}
        data={{ values: { f1: 80, f2: true, f3: 'NPO' } }}
      />
    )
    expect(screen.getByText('Admit Weight:')).toBeDefined()
  })
})
