import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NeutropenicFeverRenderer, calcMASCC } from './Renderer'

const baseData = {
  ancValue: 0,
  tempC: 0,
  masccItems: {},
  coverageChecklist: {},
}

const triggeredData = {
  ancValue: 300,
  tempC: 38.6,
  masccItems: {},
  coverageChecklist: {},
}

const highMasccData = {
  ancValue: 300,
  tempC: 38.6,
  masccItems: {
    mildSymptoms: true,        // 5
    noHypotension: true,       // 5
    noCOPD: true,              // 4
    solidTumorNoFungal: true,  // 4
    noDehydration: false,
    outpatientOnset: false,
    ageLt60: false,
  },
  coverageChecklist: {},
}

const noop = () => {}

describe('calcMASCC', () => {
  it('returns 0 for empty items', () => {
    expect(calcMASCC({})).toBe(0)
  })

  it('calculates correct score for all items true', () => {
    const allTrue = {
      mildSymptoms: true,
      noHypotension: true,
      noCOPD: true,
      solidTumorNoFungal: true,
      noDehydration: true,
      outpatientOnset: true,
      ageLt60: true,
    }
    expect(calcMASCC(allTrue)).toBe(26)
  })

  it('calculates partial score', () => {
    expect(calcMASCC({ mildSymptoms: true, noCOPD: true })).toBe(9)
  })

  it('returns 18 for high-risk scenario items', () => {
    expect(calcMASCC(highMasccData.masccItems)).toBe(18)
  })
})

describe('NeutropenicFeverRenderer', () => {
  it('renders ANC and temp inputs', () => {
    render(
      <NeutropenicFeverRenderer
        instanceId="test"
        config={{}}
        data={baseData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByLabelText(/ANC/i)).toBeTruthy()
    expect(screen.getByLabelText(/Temp/i)).toBeTruthy()
  })

  it('shows trigger alert when ANC <500 and temp >38.3', () => {
    render(
      <NeutropenicFeverRenderer
        instanceId="test"
        config={{}}
        data={triggeredData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Neutropenic Fever Criteria Met/i)).toBeTruthy()
  })

  it('does not show trigger alert when criteria not met', () => {
    render(
      <NeutropenicFeverRenderer
        instanceId="test"
        config={{}}
        data={baseData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.queryByText(/Neutropenic Fever Criteria Met/i)).toBeNull()
  })

  it('shows MASCC score total', () => {
    render(
      <NeutropenicFeverRenderer
        instanceId="test"
        config={{}}
        data={triggeredData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/MASCC Score/i)).toBeTruthy()
  })

  it('shows Low Risk when MASCC ≥21', () => {
    const lowRiskData = {
      ...triggeredData,
      masccItems: {
        mildSymptoms: true,
        noHypotension: true,
        noCOPD: true,
        solidTumorNoFungal: true,
        noDehydration: true,
        outpatientOnset: true,
        ageLt60: false,
      },
    }
    render(
      <NeutropenicFeverRenderer
        instanceId="test"
        config={{}}
        data={lowRiskData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Low Risk/i)).toBeTruthy()
  })

  it('shows High Risk when MASCC <21', () => {
    render(
      <NeutropenicFeverRenderer
        instanceId="test"
        config={{}}
        data={highMasccData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/High Risk/i)).toBeTruthy()
  })

  it('renders empiric coverage checklist', () => {
    render(
      <NeutropenicFeverRenderer
        instanceId="test"
        config={{}}
        data={triggeredData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/gram-negative/i)).toBeTruthy()
  })

  it('renders the clinical citation', () => {
    render(
      <NeutropenicFeverRenderer
        instanceId="test"
        config={{}}
        data={triggeredData}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/Freifeld AG/i)).toBeTruthy()
  })
})
