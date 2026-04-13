// src/modules/labs-panel/labs-panel.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import { labsPanelPlugin } from './index'
import { getRangeClass } from './Renderer'

const defaultConfig = labsPanelPlugin.defaultConfig

describe('labs-panel Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="lp1"
        config={defaultConfig}
        data={{}}
        onDataChange={() => {}}
        mode="live"
      />
    )
  })

  it('shows Na value when provided', () => {
    render(
      <Renderer
        instanceId="lp2"
        config={defaultConfig}
        data={{ na: 138 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('138')).toBeInTheDocument()
  })

  it('highlights out-of-range Na', () => {
    expect(getRangeClass(160, { min: 136, max: 145 })).toBe('text-red-600')
  })

  it('returns empty string for normal value', () => {
    expect(getRangeClass(140, { min: 136, max: 145 })).toBe('')
  })
})

describe('labs-panel PrintView', () => {
  it('renders without crashing', () => {
    render(<PrintView config={defaultConfig} data={{ na: 138, k: 4.0 }} />)
  })
})
