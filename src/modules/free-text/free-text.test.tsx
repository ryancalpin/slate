// src/modules/free-text/free-text.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import freeTextPlugin from './index'

const noop = () => {}

describe('free-text Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="test"
        config={freeTextPlugin.defaultConfig}
        data={{ text: '' }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText('Notes')).toBeDefined()
  })

  it('shows existing text content', () => {
    render(
      <Renderer
        instanceId="test"
        config={freeTextPlugin.defaultConfig}
        data={{ text: 'Patient improving' }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('Patient improving')).toBeDefined()
  })

  it('shows placeholder in build mode', () => {
    render(
      <Renderer
        instanceId="test"
        config={freeTextPlugin.defaultConfig}
        data={{ text: '' }}
        onDataChange={noop}
        mode="build"
      />
    )
    expect(screen.getByPlaceholderText('Enter notes here...')).toBeDefined()
  })
})

describe('free-text PrintView', () => {
  it('renders without crashing', () => {
    render(
      <PrintView
        config={freeTextPlugin.defaultConfig}
        data={{ text: 'Some clinical notes\nWith a second line' }}
      />
    )
    expect(screen.getByText('Notes')).toBeDefined()
  })
})
