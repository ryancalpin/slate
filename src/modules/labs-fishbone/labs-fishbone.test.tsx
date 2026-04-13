// src/modules/labs-fishbone/labs-fishbone.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import { labsFishbonePlugin } from './index'

const defaultConfig = labsFishbonePlugin.defaultConfig

describe('labs-fishbone Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="lf1"
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
        instanceId="lf2"
        config={defaultConfig}
        data={{ na: 138 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('138')).toBeInTheDocument()
  })

  it('shows placeholder labels in build mode', () => {
    render(
      <Renderer
        instanceId="lf3"
        config={defaultConfig}
        data={{}}
        onDataChange={() => {}}
        mode="build"
      />
    )
    expect(screen.getByPlaceholderText('Na')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('K')).toBeInTheDocument()
  })

  it('shows Glucose when showGlucose is true', () => {
    render(
      <Renderer
        instanceId="lf4"
        config={{ ...defaultConfig, showGlucose: true }}
        data={{}}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByPlaceholderText('Glu')).toBeInTheDocument()
  })
})

describe('labs-fishbone PrintView', () => {
  it('renders without crashing', () => {
    render(<PrintView config={defaultConfig} data={{ na: 138, k: 4.0 }} />)
  })
})
