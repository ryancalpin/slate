import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Renderer } from './Renderer'
import { Editor } from './Editor'
import { PrintView } from './PrintView'

const defaultData = {
  modality: 'HD' as const,
  hd: { access: 'AV fistula', bfr: 350, dfr: 500, ufGoal: 2.5, duration: 4, anticoag: 'heparin' },
  crrt: { mode: 'CVVHDF', effluentRate: 25, replacementRate: 1000, anticoag: 'citrate', filterAge: 0 },
  pd: { dwellVol: 2000, dwellTime: 4, cyclesPerDay: 4, glucoseConc: '2.5%', dailyUF: 500 },
}

const defaultConfig = {}

describe('dialysis-settings Renderer', () => {
  it('renders modality selector', () => {
    render(
      <Renderer
        instanceId="test"
        config={defaultConfig}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByText('HD')).toBeDefined()
    expect(screen.getByText('CRRT')).toBeDefined()
    expect(screen.getByText('PD')).toBeDefined()
  })

  it('shows HD fields when modality is HD', () => {
    render(
      <Renderer
        instanceId="test"
        config={defaultConfig}
        data={defaultData}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByLabelText(/blood flow rate/i)).toBeDefined()
    expect(screen.getByLabelText(/dialysate flow rate/i)).toBeDefined()
  })

  it('shows CRRT fields when modality is CRRT', () => {
    render(
      <Renderer
        instanceId="test"
        config={defaultConfig}
        data={{ ...defaultData, modality: 'CRRT' as const }}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByLabelText(/effluent rate/i)).toBeDefined()
    expect(screen.getByLabelText(/filter age/i)).toBeDefined()
  })

  it('shows PD fields when modality is PD', () => {
    render(
      <Renderer
        instanceId="test"
        config={defaultConfig}
        data={{ ...defaultData, modality: 'PD' as const }}
        onDataChange={vi.fn()}
        mode="live"
      />
    )
    expect(screen.getByLabelText(/dwell volume/i)).toBeDefined()
    expect(screen.getByLabelText(/cycles per day/i)).toBeDefined()
  })

  it('calls onDataChange when modality changes', () => {
    const onDataChange = vi.fn()
    render(
      <Renderer
        instanceId="test"
        config={defaultConfig}
        data={defaultData}
        onDataChange={onDataChange}
        mode="live"
      />
    )
    fireEvent.click(screen.getByText('CRRT'))
    expect(onDataChange).toHaveBeenCalledWith(expect.objectContaining({ modality: 'CRRT' }))
  })
})

describe('dialysis-settings Editor', () => {
  it('renders without crashing', () => {
    render(<Editor config={defaultConfig} onConfigChange={vi.fn()} />)
    expect(screen.getByText(/dialysis settings/i)).toBeDefined()
  })
})

describe('dialysis-settings PrintView', () => {
  it('renders modality and relevant fields', () => {
    render(<PrintView config={defaultConfig} data={defaultData} />)
    expect(screen.getByText(/HD/)).toBeDefined()
    expect(screen.getByText(/AV fistula/i)).toBeDefined()
  })
})
