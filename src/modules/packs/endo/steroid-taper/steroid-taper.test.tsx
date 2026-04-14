import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import Renderer from './Renderer'

// Pin today's date so "today highlight" tests are deterministic
beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2024-06-15T12:00:00'))
})

describe('Renderer — steroid-taper', () => {
  const defaultData = {
    drug: 'Prednisone',
    schedule: [
      { date: '2024-06-14', dose: 60, unit: 'mg' },
      { date: '2024-06-15', dose: 40, unit: 'mg' },
      { date: '2024-06-16', dose: 20, unit: 'mg' },
    ],
    prolongedHighDose: false,
  }
  const noop = () => {}

  it('renders drug name', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    expect(screen.getByDisplayValue('Prednisone')).toBeTruthy()
  })

  it('renders all schedule rows', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    expect(screen.getByText('2024-06-14')).toBeTruthy()
    expect(screen.getByText('2024-06-15')).toBeTruthy()
    expect(screen.getByText('2024-06-16')).toBeTruthy()
  })

  it('highlights today\'s row', () => {
    const { container } = render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    // Today is 2024-06-15 — the row should have a highlight class
    const rows = container.querySelectorAll('tr')
    // Find the row that contains 2024-06-15
    const todayRow = Array.from(rows).find((r) => r.textContent?.includes('2024-06-15'))
    expect(todayRow?.className).toMatch(/ring|highlight|today|bg-blue|border-blue/)
  })

  it('does not show advisory note when prolongedHighDose is false', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    expect(screen.queryByText(/HPA axis/)).toBeNull()
  })

  it('shows advisory note when prolongedHighDose is true', () => {
    render(
      <Renderer
        instanceId="t"
        config={{}}
        data={{ ...defaultData, prolongedHighDose: true }}
        onDataChange={noop}
        mode="live"
      />
    )
    expect(screen.getByText(/HPA axis/)).toBeTruthy()
  })

  it('renders the prolonged high-dose checkbox', () => {
    render(
      <Renderer instanceId="t" config={{}} data={defaultData} onDataChange={noop} mode="live" />
    )
    expect(screen.getByRole('checkbox')).toBeTruthy()
  })
})
