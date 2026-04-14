import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { calcGBS, calcRockall, GiBleedRenderer } from './Renderer'
import type { GBSInputs, RockallInputs } from './Renderer'

describe('calcGBS', () => {
  it('returns 0 for low-risk presentation', () => {
    const inputs: GBSInputs = {
      bun: 10,        // <18.2 → 0
      hgb: 14,        // male ≥13 → 0
      sbp: 120,       // ≥110 → 0
      hr: 80,         // <100 → 0
      melena: false,
      syncope: false,
      liverDisease: false,
      heartFailure: false,
      sex: 'male',
    }
    expect(calcGBS(inputs)).toBe(0)
  })

  it('adds correct points for BUN 18.2-22.3', () => {
    const base: GBSInputs = { bun: 0, hgb: 14, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, bun: 20 })).toBe(2)
  })

  it('adds correct points for BUN 22.4-28', () => {
    const base: GBSInputs = { bun: 0, hgb: 14, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, bun: 25 })).toBe(3)
  })

  it('adds correct points for BUN 28.1-70', () => {
    const base: GBSInputs = { bun: 0, hgb: 14, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, bun: 50 })).toBe(4)
  })

  it('adds 6 points for BUN >70', () => {
    const base: GBSInputs = { bun: 0, hgb: 14, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, bun: 80 })).toBe(6)
  })

  it('adds correct points for male Hgb 12-12.9', () => {
    const base: GBSInputs = { bun: 0, hgb: 13, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, hgb: 12.5 })).toBe(1)
  })

  it('adds 3 points for male Hgb 10-11.9', () => {
    const base: GBSInputs = { bun: 0, hgb: 13, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, hgb: 11 })).toBe(3)
  })

  it('adds 6 points for male Hgb <10', () => {
    const base: GBSInputs = { bun: 0, hgb: 13, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, hgb: 9 })).toBe(6)
  })

  it('uses female Hgb cutoffs for females', () => {
    const base: GBSInputs = { bun: 0, hgb: 13, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'female' }
    // female ≥12 → 0
    expect(calcGBS({ ...base, hgb: 12 })).toBe(0)
    // female 10-11.9 → 1
    expect(calcGBS({ ...base, hgb: 11 })).toBe(1)
    // female <10 → 6
    expect(calcGBS({ ...base, hgb: 9 })).toBe(6)
  })

  it('adds 1 for SBP 100-109', () => {
    const base: GBSInputs = { bun: 0, hgb: 14, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, sbp: 105 })).toBe(1)
  })

  it('adds 2 for SBP 90-99', () => {
    const base: GBSInputs = { bun: 0, hgb: 14, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, sbp: 95 })).toBe(2)
  })

  it('adds 3 for SBP <90', () => {
    const base: GBSInputs = { bun: 0, hgb: 14, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, sbp: 85 })).toBe(3)
  })

  it('adds 1 for HR ≥100', () => {
    const base: GBSInputs = { bun: 0, hgb: 14, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, hr: 100 })).toBe(1)
  })

  it('adds points for melena, syncope, liver disease, heart failure', () => {
    const base: GBSInputs = { bun: 0, hgb: 14, sbp: 120, hr: 80, melena: false, syncope: false, liverDisease: false, heartFailure: false, sex: 'male' }
    expect(calcGBS({ ...base, melena: true })).toBe(1)
    expect(calcGBS({ ...base, syncope: true })).toBe(2)
    expect(calcGBS({ ...base, liverDisease: true })).toBe(2)
    expect(calcGBS({ ...base, heartFailure: true })).toBe(2)
  })

  it('calculates a high-risk scenario correctly', () => {
    const highRisk: GBSInputs = {
      bun: 80,         // +6
      hgb: 9,          // male <10 → +6
      sbp: 85,         // <90 → +3
      hr: 110,         // ≥100 → +1
      melena: true,    // +1
      syncope: true,   // +2
      liverDisease: true,   // +2
      heartFailure: true,   // +2
      sex: 'male',
    }
    expect(calcGBS(highRisk)).toBe(23)
  })
})

describe('calcRockall', () => {
  it('returns 0 for lowest-risk profile', () => {
    const inputs: RockallInputs = {
      age: 50,          // <60 → 0
      shock: 0,         // no shock → 0
      comorbidity: 0,   // none → 0
      diagnosis: 0,     // Mallory-Weiss / no SRH → 0
      majorSRH: false,  // none/dark spot → 0
    }
    expect(calcRockall(inputs)).toBe(0)
  })

  it('adds 1 for age 60-79', () => {
    const base: RockallInputs = { age: 50, shock: 0, comorbidity: 0, diagnosis: 0, majorSRH: false }
    expect(calcRockall({ ...base, age: 70 })).toBe(1)
  })

  it('adds 2 for age ≥80', () => {
    const base: RockallInputs = { age: 50, shock: 0, comorbidity: 0, diagnosis: 0, majorSRH: false }
    expect(calcRockall({ ...base, age: 82 })).toBe(2)
  })

  it('adds correct shock points', () => {
    const base: RockallInputs = { age: 50, shock: 0, comorbidity: 0, diagnosis: 0, majorSRH: false }
    expect(calcRockall({ ...base, shock: 1 })).toBe(1)
    expect(calcRockall({ ...base, shock: 2 })).toBe(2)
  })

  it('adds correct comorbidity points', () => {
    const base: RockallInputs = { age: 50, shock: 0, comorbidity: 0, diagnosis: 0, majorSRH: false }
    expect(calcRockall({ ...base, comorbidity: 2 })).toBe(2)
    expect(calcRockall({ ...base, comorbidity: 3 })).toBe(3)
  })

  it('adds correct diagnosis points', () => {
    const base: RockallInputs = { age: 50, shock: 0, comorbidity: 0, diagnosis: 0, majorSRH: false }
    expect(calcRockall({ ...base, diagnosis: 1 })).toBe(1)
    expect(calcRockall({ ...base, diagnosis: 2 })).toBe(2)
  })

  it('adds 2 for major SRH', () => {
    const base: RockallInputs = { age: 50, shock: 0, comorbidity: 0, diagnosis: 0, majorSRH: false }
    expect(calcRockall({ ...base, majorSRH: true })).toBe(2)
  })

  it('calculates a high-risk profile', () => {
    const highRisk: RockallInputs = {
      age: 82,          // +2
      shock: 2,         // +2
      comorbidity: 3,   // +3
      diagnosis: 2,     // +2
      majorSRH: true,   // +2
    }
    expect(calcRockall(highRisk)).toBe(11)
  })
})

describe('GiBleedRenderer', () => {
  const defaultData = {
    sex: 'male' as const,
    bun: 10,
    hgb: 14,
    sbp: 120,
    hr: 80,
    melena: false,
    syncope: false,
    liverDisease: false,
    heartFailure: false,
    age: 45,
    shock: 0 as const,
    comorbidity: 0 as const,
    diagnosis: 0 as const,
    majorSRH: false,
  }

  it('renders Glasgow-Blatchford Score section', () => {
    render(
      <GiBleedRenderer
        instanceId="test-1"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Glasgow-Blatchford/i)).toBeTruthy()
  })

  it('renders Rockall Score section', () => {
    render(
      <GiBleedRenderer
        instanceId="test-2"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Rockall/i)).toBeTruthy()
  })

  it('renders GBS score output', () => {
    render(
      <GiBleedRenderer
        instanceId="test-3"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/GBS/i)).toBeTruthy()
  })

  it('renders Blatchford citation', () => {
    render(
      <GiBleedRenderer
        instanceId="test-4"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Blatchford/i)).toBeTruthy()
  })

  it('renders Rockall citation', () => {
    render(
      <GiBleedRenderer
        instanceId="test-5"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Rockall TA/i)).toBeTruthy()
  })

  it('calls onDataChange when BUN input changes', () => {
    const onDataChange = vi.fn()
    render(
      <GiBleedRenderer
        instanceId="test-6"
        config={{}}
        data={defaultData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.change(screen.getByLabelText(/BUN/i), { target: { value: '25' } })
    expect(onDataChange).toHaveBeenCalled()
  })

  it('shows low-risk label when GBS is 0', () => {
    render(
      <GiBleedRenderer
        instanceId="test-7"
        config={{}}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Low risk/i)).toBeTruthy()
  })
})
