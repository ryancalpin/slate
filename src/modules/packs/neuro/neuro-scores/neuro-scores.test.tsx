import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcGCS } from './Renderer'
import { Renderer } from './Renderer'

// --- Pure function tests ---

describe('calcGCS', () => {
  it('returns 3 for minimum (1+1+1)', () => {
    expect(calcGCS(1, 1, 1)).toBe(3)
  })

  it('returns 15 for maximum (4+5+6)', () => {
    expect(calcGCS(4, 5, 6)).toBe(15)
  })

  it('sums correctly for mid-range values', () => {
    expect(calcGCS(3, 4, 5)).toBe(12)
  })
})

// --- Render tests ---

describe('Neuro-Scores Renderer', () => {
  const defaultData = {
    mrs: 0,
    gcsE: 4,
    gcsV: 5,
    gcsM: 6,
    huntHess: 1,
    fisherGrade: 1,
  }
  const noop = () => {}

  it('renders mRS section', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Modified Rankin/i)).toBeTruthy()
  })

  it('renders GCS section', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Glasgow Coma/i)).toBeTruthy()
  })

  it('renders Hunt-Hess section', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Hunt.Hess/i)).toBeTruthy()
  })

  it('renders Fisher Grade section', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Fisher/i)).toBeTruthy()
  })

  it('shows GCS total of 15 for default data', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    // GCS total = 4+5+6 = 15
    expect(screen.getByText('15')).toBeTruthy()
  })

  it('renders all citations', () => {
    render(
      <Renderer
        instanceId="test"
        config={{}}
        data={defaultData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/van Swieten/i)).toBeTruthy()
    expect(screen.getByText(/Teasdale/i)).toBeTruthy()
    expect(screen.getByText(/Hunt WE/i)).toBeTruthy()
    expect(screen.getByText(/Fisher CM/i)).toBeTruthy()
  })
})
