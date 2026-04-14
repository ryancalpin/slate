import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { calcCPP } from './Renderer'
import { Renderer } from './Renderer'

// --- Pure function tests ---

describe('calcCPP', () => {
  it('returns CPP = MAP - ICP', () => {
    expect(calcCPP(80, 15)).toBe(65)
  })

  it('returns 0 when MAP equals ICP', () => {
    expect(calcCPP(20, 20)).toBe(0)
  })

  it('returns negative when ICP exceeds MAP', () => {
    expect(calcCPP(50, 60)).toBe(-10)
  })
})

// --- Render tests ---

describe('ICP Monitor Renderer', () => {
  const defaultData = {
    icp: 12,
    map: 80,
    cppTarget: 60,
    pupilL: { sizeMm: 3, reactivity: 'brisk' },
    pupilR: { sizeMm: 3, reactivity: 'brisk' },
    evdEnabled: false,
    evd: { refLevel: 0, drainThreshold: 20, drainRate: 0 },
  }
  const noop = () => {}

  it('renders ICP and MAP fields', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/ICP/i)).toBeTruthy()
    expect(screen.getByText(/MAP/i)).toBeTruthy()
  })

  it('displays calculated CPP', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    // CPP = 80 - 12 = 68
    expect(screen.getByText('68')).toBeTruthy()
  })

  it('renders pupil tracker for both eyes', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Left/i)).toBeTruthy()
    expect(screen.getByText(/Right/i)).toBeTruthy()
  })

  it('shows ICP alert when ICP > 20', () => {
    const highICP = { ...defaultData, icp: 25 }
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={highICP}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/ICP elevated/i)).toBeTruthy()
  })

  it('shows CPP alert when CPP < 60', () => {
    const lowCPP = { ...defaultData, icp: 30, map: 75 }
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={lowCPP}
        onDataChange={noop}
        mode="live"
      />
    )
    // CPP = 75 - 30 = 45 < 60 → alert
    expect(screen.getByText(/CPP low/i)).toBeTruthy()
  })

  it('renders EVD section when enabled', () => {
    const withEvd = { ...defaultData, evdEnabled: true }
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={withEvd}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/EVD/i)).toBeTruthy()
  })

  it('renders citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Carney N/i)).toBeTruthy()
  })
})
