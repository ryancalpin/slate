import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { calcPercentTarget } from './index'
import Renderer from './Renderer'

describe('calcPercentTarget', () => {
  it('returns correct percentage', () => {
    expect(calcPercentTarget(25, 50)).toBe(50)
  })

  it('returns 100 when current exceeds target', () => {
    expect(calcPercentTarget(60, 50)).toBe(100)
  })

  it('returns 0 when target is 0', () => {
    expect(calcPercentTarget(0, 0)).toBe(0)
  })

  it('returns 0 when current is 0', () => {
    expect(calcPercentTarget(0, 50)).toBe(0)
  })

  it('rounds to nearest integer', () => {
    expect(calcPercentTarget(1, 3)).toBe(33)
  })
})

const defaultData = {
  betaBlocker: { drug: 'Carvedilol', currentDose: 12.5, targetDose: 25, unit: 'mg BID', active: true },
  aceArb:      { drug: 'Lisinopril', currentDose: 10,   targetDose: 40, unit: 'mg/day', active: true },
  mra:         { drug: 'Spironolactone', currentDose: 25, targetDose: 50, unit: 'mg/day', active: true },
  sglt2i:      { drug: 'Dapagliflozin', currentDose: 10, targetDose: 10, unit: 'mg/day', active: true },
}

describe('GdmtRenderer', () => {
  it('renders all 4 drug class rows', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'GDMT' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/Beta.blocker/i)).toBeTruthy()
    expect(screen.getByText(/ACEi\/ARB\/ARNI/i)).toBeTruthy()
    expect(screen.getByText(/MRA/i)).toBeTruthy()
    expect(screen.getByText(/SGLT2i/i)).toBeTruthy()
  })

  it('shows percent of target for each drug', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'GDMT' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    // Carvedilol: 12.5/25 = 50%
    expect(screen.getAllByText(/50%/).length).toBeGreaterThan(0)
    // SGLT2i: 10/10 = 100%
    expect(screen.getAllByText(/100%/).length).toBeGreaterThan(0)
  })

  it('displays citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'GDMT' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/2022 AHA\/ACC\/HFSA/i)).toBeTruthy()
  })

  it('calls onDataChange when drug name is edited in live mode', () => {
    const onDataChange = vi.fn()
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'GDMT' }}
        data={defaultData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    const inputs = screen.getAllByDisplayValue('Carvedilol')
    fireEvent.change(inputs[0], { target: { value: 'Metoprolol Succinate' } })
    expect(onDataChange).toHaveBeenCalledTimes(1)
  })
})
