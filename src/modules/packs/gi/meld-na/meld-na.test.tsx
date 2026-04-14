import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { calcMELD, calcMELDNa } from './Renderer'
import { MeldNaRenderer } from './Renderer'

describe('calcMELD', () => {
  it('calculates correctly with standard inputs', () => {
    // cr=1.0, bili=1.0, inr=1.0 → 3.78*ln(1)+11.2*ln(1)+9.57*ln(1)+6.43 = 6.43 → 6
    expect(calcMELD(1.0, 1.0, 1.0)).toBe(6)
  })

  it('caps creatinine at 4.0 per UNOS rules', () => {
    const uncapped = calcMELD(4.0, 2.0, 1.5)
    const capped = calcMELD(5.0, 2.0, 1.5)
    expect(uncapped).toBe(capped)
  })

  it('enforces minimum bilirubin of 1.0', () => {
    const floored = calcMELD(1.0, 0.3, 1.0)
    const atMin = calcMELD(1.0, 1.0, 1.0)
    expect(floored).toBe(atMin)
  })

  it('enforces minimum INR of 1.0', () => {
    const floored = calcMELD(1.0, 1.0, 0.5)
    const atMin = calcMELD(1.0, 1.0, 1.0)
    expect(floored).toBe(atMin)
  })

  it('returns integer', () => {
    const result = calcMELD(1.5, 2.3, 1.8)
    expect(Number.isInteger(result)).toBe(true)
  })

  it('calculates a known clinical example', () => {
    // cr=2.0, bili=3.0, inr=2.0
    // = 3.78*ln(3)+11.2*ln(2)+9.57*ln(2)+6.43
    // = 3.78*1.0986+11.2*0.6931+9.57*0.6931+6.43
    // = 4.153+7.763+6.630+6.43 = 24.976 → 25
    expect(calcMELD(2.0, 3.0, 2.0)).toBe(25)
  })
})

describe('calcMELDNa', () => {
  it('constrains sodium to 125-137 range', () => {
    const low = calcMELDNa(20, 120)
    const atFloor = calcMELDNa(20, 125)
    expect(low).toBe(atFloor)

    const high = calcMELDNa(20, 145)
    const atCeil = calcMELDNa(20, 137)
    expect(high).toBe(atCeil)
  })

  it('returns MELD when sodium is 137 (no adjustment)', () => {
    // MELD-Na = MELD + 1.32*(137-137) - 0.033*MELD*(137-137) = MELD
    expect(calcMELDNa(20, 137)).toBe(20)
  })

  it('increases score when sodium is low', () => {
    expect(calcMELDNa(20, 125)).toBeGreaterThan(20)
  })

  it('returns integer', () => {
    expect(Number.isInteger(calcMELDNa(15, 130))).toBe(true)
  })
})

describe('MeldNaRenderer', () => {
  const defaultData = { creatinine: 1.0, bilirubin: 1.0, inr: 1.0, sodium: 137 }

  it('renders input fields', () => {
    render(
      <MeldNaRenderer
        instanceId="test-1"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByLabelText(/creatinine/i)).toBeTruthy()
    expect(screen.getByLabelText(/bilirubin/i)).toBeTruthy()
    expect(screen.getByLabelText(/inr/i)).toBeTruthy()
    expect(screen.getByLabelText(/sodium/i)).toBeTruthy()
  })

  it('renders MELD and MELD-Na score labels', () => {
    render(
      <MeldNaRenderer
        instanceId="test-2"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/MELD Score/i)).toBeTruthy()
    expect(screen.getByText(/MELD-Na/i)).toBeTruthy()
  })

  it('renders 90-day mortality table', () => {
    render(
      <MeldNaRenderer
        instanceId="test-3"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/90-day mortality/i)).toBeTruthy()
    expect(screen.getByText(/1\.9%/)).toBeTruthy()
    expect(screen.getByText(/71\.3%/)).toBeTruthy()
  })

  it('renders citation', () => {
    render(
      <MeldNaRenderer
        instanceId="test-4"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Kim WR/i)).toBeTruthy()
  })

  it('calls onDataChange when creatinine input changes', () => {
    const onDataChange = vi.fn()
    render(
      <MeldNaRenderer
        instanceId="test-5"
        config={{}}
        data={defaultData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.change(screen.getByLabelText(/creatinine/i), { target: { value: '2.5' } })
    expect(onDataChange).toHaveBeenCalled()
  })
})
