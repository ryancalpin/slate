import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SatSbtRenderer } from './Renderer'

const emptyData = {
  satScreen: {},
  sbtScreen: {},
  lastSatDate: '',
  lastSbtDate: '',
  lastSbtPassed: false,
}

const allSatPass = {
  satScreen: {
    noAgitation: true,
    noSeizures: true,
    noWithdrawal: true,
    noParalytic: true,
    noElevatedICP: true,
    noHighFiO2: true,
  },
  sbtScreen: {},
  lastSatDate: '',
  lastSbtDate: '',
  lastSbtPassed: false,
}

const allBothPass = {
  satScreen: {
    noAgitation: true,
    noSeizures: true,
    noWithdrawal: true,
    noParalytic: true,
    noElevatedICP: true,
    noHighFiO2: true,
  },
  sbtScreen: {
    fio2Ok: true,
    peepOk: true,
    noVasopressors: true,
    passedSat: true,
    coughOk: true,
  },
  lastSatDate: '2026-04-12',
  lastSbtDate: '2026-04-12',
  lastSbtPassed: true,
}

describe('SatSbtRenderer', () => {
  it('renders SAT and SBT section headings', () => {
    render(
      <SatSbtRenderer
        instanceId="test-1"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/SAT Safety Screen/i)).toBeTruthy()
    expect(screen.getByText(/SBT Safety Screen/i)).toBeTruthy()
  })

  it('shows SAT FAIL when not all items checked', () => {
    render(
      <SatSbtRenderer
        instanceId="test-2"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('SAT FAIL')).toBeTruthy()
    expect(screen.getByText('SBT FAIL')).toBeTruthy()
  })

  it('shows SAT PASS when all SAT items checked', () => {
    render(
      <SatSbtRenderer
        instanceId="test-3"
        config={{}}
        data={allSatPass}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('SAT PASS')).toBeTruthy()
  })

  it('shows SBT PASS when all SBT items checked', () => {
    render(
      <SatSbtRenderer
        instanceId="test-4"
        config={{}}
        data={allBothPass}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('SAT PASS')).toBeTruthy()
    expect(screen.getByText('SBT PASS')).toBeTruthy()
  })

  it('renders the citation', () => {
    render(
      <SatSbtRenderer
        instanceId="test-5"
        config={{}}
        data={emptyData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText(/Girard TD/i)).toBeTruthy()
  })

  it('calls onDataChange when a SAT checkbox is toggled', () => {
    const onDataChange = vi.fn()
    render(
      <SatSbtRenderer
        instanceId="test-6"
        config={{}}
        data={emptyData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])
    expect(onDataChange).toHaveBeenCalledOnce()
  })

  it('renders last SAT and SBT dates when provided', () => {
    render(
      <SatSbtRenderer
        instanceId="test-7"
        config={{}}
        data={allBothPass}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getAllByText(/2026-04-12/).length).toBeGreaterThan(0)
  })
})
