import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const makeEntry = (date: string, overrides: Partial<Record<string, number>> = {}) => ({
  date,
  na: 140, k: 4.0, cl: 102, hco3: 24, bun: 15, cr: 0.9, ca: 9.5, mg: 2.0, phos: 3.5,
  ...overrides,
})

const defaultData = {
  entries: [
    makeEntry('2026-04-13'),
    makeEntry('2026-04-12', { k: 6.5 }),  // hyperkalemia — out of range
  ],
}

const defaultConfig = {}

describe('electrolyte-tracker Renderer', () => {
  it('renders column headers', () => {
    render(<Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />)
    expect(screen.getByText('Na')).toBeDefined()
    expect(screen.getByText('K')).toBeDefined()
    expect(screen.getByText('Phos')).toBeDefined()
  })

  it('shows normal ranges in header', () => {
    render(<Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />)
    expect(screen.getByText(/136-145/)).toBeDefined()
    expect(screen.getByText(/3\.5-5\.0/)).toBeDefined()
  })

  it('marks out-of-range cells', () => {
    const { container } = render(
      <Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={vi.fn()} mode="live" />
    )
    const redCells = container.querySelectorAll('.text-red-600')
    expect(redCells.length).toBeGreaterThan(0)
  })

  it('adds a new row on button click', () => {
    const onDataChange = vi.fn()
    render(<Renderer instanceId="t" config={defaultConfig} data={defaultData} onDataChange={onDataChange} mode="live" />)
    fireEvent.click(screen.getByText(/add row/i))
    expect(onDataChange).toHaveBeenCalledWith(
      expect.objectContaining({
        entries: expect.arrayContaining([expect.objectContaining({ date: expect.any(String) })]),
      })
    )
  })
})

describe('electrolyte-tracker Editor', () => {
  it('renders without crashing', () => {
    render(<Editor config={defaultConfig} onConfigChange={vi.fn()} />)
    expect(screen.getByText(/electrolyte tracker/i)).toBeDefined()
  })
})

describe('electrolyte-tracker PrintView', () => {
  it('renders date and values', () => {
    render(<PrintView config={defaultConfig} data={defaultData} />)
    expect(screen.getByText('2026-04-13')).toBeDefined()
    expect(screen.getByText('6.5')).toBeDefined()
  })
})
