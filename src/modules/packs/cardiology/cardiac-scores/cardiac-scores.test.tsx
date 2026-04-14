import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcTIMI, interpretGRACE } from './index'
import Renderer from './Renderer'

describe('calcTIMI', () => {
  it('returns 0 for empty items', () => {
    expect(calcTIMI([false, false, false, false, false, false, false])).toBe(0)
  })

  it('returns correct count for partial items', () => {
    expect(calcTIMI([true, true, false, false, false, false, false])).toBe(2)
  })

  it('returns 7 for all items checked', () => {
    expect(calcTIMI([true, true, true, true, true, true, true])).toBe(7)
  })

  it('handles empty array gracefully', () => {
    expect(calcTIMI([])).toBe(0)
  })
})

describe('interpretGRACE', () => {
  it('returns low for score < 108', () => {
    expect(interpretGRACE(80)).toBe('low')
    expect(interpretGRACE(107)).toBe('low')
  })

  it('returns intermediate for score 108-140', () => {
    expect(interpretGRACE(108)).toBe('intermediate')
    expect(interpretGRACE(140)).toBe('intermediate')
  })

  it('returns high for score > 140', () => {
    expect(interpretGRACE(141)).toBe('high')
    expect(interpretGRACE(250)).toBe('high')
  })
})

const defaultData = {
  timiItems: [false, false, false, false, false, false, false],
  graceScore: 0,
  graceComponents: {},
}

describe('CardiacScoresRenderer', () => {
  it('renders TIMI section', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Cardiac Scores' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/TIMI/i)).toBeTruthy()
  })

  it('renders GRACE section', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Cardiac Scores' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/GRACE/i)).toBeTruthy()
  })

  it('shows TIMI score of 0 initially', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Cardiac Scores' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/TIMI Score.*0/i)).toBeTruthy()
  })

  it('shows correct TIMI risk % for score 0', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Cardiac Scores' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/4\.7%/)).toBeTruthy()
  })

  it('displays TIMI citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Cardiac Scores' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Antman EM/i)).toBeTruthy()
  })

  it('displays GRACE citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Cardiac Scores' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Fox KA/i)).toBeTruthy()
  })
})
