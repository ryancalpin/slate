import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { calcCHADS2VASc, calcHASBLED } from './index'
import Renderer from './Renderer'

describe('calcCHADS2VASc', () => {
  it('returns 0 for no risk factors', () => {
    expect(calcCHADS2VASc({})).toBe(0)
  })

  it('counts single-point items correctly', () => {
    expect(calcCHADS2VASc({ chf: true, hypertension: true })).toBe(2)
  })

  it('counts double-point items (age >= 75, stroke/TIA) correctly', () => {
    expect(calcCHADS2VASc({ age75: true, stroke: true })).toBe(4)
  })

  it('max score calculation', () => {
    expect(calcCHADS2VASc({
      chf: true, hypertension: true, age75: true, diabetes: true,
      stroke: true, vascular: true, age6574: true, female: true,
    })).toBe(9)
  })
})

describe('calcHASBLED', () => {
  it('returns 0 for no risk factors', () => {
    expect(calcHASBLED({})).toBe(0)
  })

  it('sums all single-point items', () => {
    expect(calcHASBLED({
      hypertension: true, renalDysfunction: true, liverDysfunction: true,
      stroke: true, bleeding: true, labileInr: true, elderly: true,
      drugs: true, alcohol: true,
    })).toBe(9)
  })

  it('ignores false values', () => {
    expect(calcHASBLED({ hypertension: false, stroke: true })).toBe(1)
  })
})

const defaultData = {
  rhythm: 'AF',
  chadsItems: {},
  hasbledItems: {},
}

describe('RhythmPacerRenderer', () => {
  it('renders rhythm dropdown', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Rhythm' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('AF')).toBeTruthy()
  })

  it('does NOT show pacemaker fields for AF rhythm', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Rhythm' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.queryByText(/Pacemaker Mode/i)).toBeNull()
  })

  it('shows pacemaker fields for Paced rhythm', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Rhythm' }}
        data={{ ...defaultData, rhythm: 'Paced' }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Pacemaker/i)).toBeTruthy()
  })

  it('renders CHADS2-VASc section', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Rhythm' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/CHADS.*VASc/i)).toBeTruthy()
  })

  it('renders HAS-BLED section', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Rhythm' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/HAS-BLED/i)).toBeTruthy()
  })

  it('displays CHADS2-VASc citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Rhythm' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Lip GY/i)).toBeTruthy()
  })

  it('displays HAS-BLED citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Rhythm' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Pisters R/i)).toBeTruthy()
  })
})
