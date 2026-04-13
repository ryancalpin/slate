// src/modules/vitals/vitals.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import { vitalsPlugin } from './index'
import { getTrendArrow, getRangeClass } from './Renderer'

const defaultConfig = vitalsPlugin.defaultConfig

describe('vitals Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="v1"
        config={defaultConfig}
        data={{}}
        onDataChange={() => {}}
        mode="live"
      />
    )
  })

  it('shows HR value when provided', () => {
    render(
      <Renderer
        instanceId="v2"
        config={defaultConfig}
        data={{ hr: 72 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('72')).toBeInTheDocument()
  })

  it('shows build mode dashes', () => {
    render(
      <Renderer
        instanceId="v3"
        config={defaultConfig}
        data={{}}
        onDataChange={() => {}}
        mode="build"
      />
    )
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })
})

describe('vitals calculations', () => {
  it('getTrendArrow returns ↑ when current > prev', () => {
    expect(getTrendArrow(80, 70)).toBe('↑')
  })
  it('getTrendArrow returns ↓ when current < prev', () => {
    expect(getTrendArrow(60, 70)).toBe('↓')
  })
  it('getTrendArrow returns → when equal', () => {
    expect(getTrendArrow(70, 70)).toBe('→')
  })
  it('getRangeClass returns red for critical high HR', () => {
    expect(getRangeClass(150, { min: 60, max: 100 })).toBe('text-red-600')
  })
  it('getRangeClass returns amber for borderline HR', () => {
    expect(getRangeClass(105, { min: 60, max: 100 })).toBe('text-amber-500')
  })
  it('getRangeClass returns empty string for normal HR', () => {
    expect(getRangeClass(75, { min: 60, max: 100 })).toBe('')
  })
})

describe('vitals PrintView', () => {
  it('renders without crashing', () => {
    render(<PrintView config={defaultConfig} data={{ hr: 72, spo2: 98 }} />)
  })
})
