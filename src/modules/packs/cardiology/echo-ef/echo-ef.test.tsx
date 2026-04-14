import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { classifyEF } from './index'
import Renderer from './Renderer'

describe('classifyEF', () => {
  it('classifies EF < 40 as HFrEF', () => {
    expect(classifyEF(35)).toBe('HFrEF')
    expect(classifyEF(39)).toBe('HFrEF')
  })

  it('classifies EF 40-49 as HFmrEF', () => {
    expect(classifyEF(40)).toBe('HFmrEF')
    expect(classifyEF(49)).toBe('HFmrEF')
  })

  it('classifies EF >= 50 as HFpEF', () => {
    expect(classifyEF(50)).toBe('HFpEF')
    expect(classifyEF(65)).toBe('HFpEF')
  })
})

const defaultData = {
  ef: 35,
  echoDate: '2026-04-13',
  lvedd: 62,
  lvesd: 50,
  wallMotion: 'Global hypokinesis',
  valvular: 'Mild MR',
}

describe('EchoEFRenderer', () => {
  it('renders EF value and classification', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Echo / EF' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('35')).toBeTruthy()
    expect(screen.getByText(/HFrEF/i)).toBeTruthy()
  })

  it('renders correct classification for HFpEF', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Echo / EF' }}
        data={{ ...defaultData, ef: 60 }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/HFpEF/i)).toBeTruthy()
  })

  it('displays citation', () => {
    render(
      <Renderer
        instanceId="test"
        config={{ title: 'Echo / EF' }}
        data={defaultData}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByText(/2022 AHA\/ACC\/HFSA/i)).toBeTruthy()
  })
})
