// src/modules/patient-header/patient-header.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Renderer } from './Renderer'
import { PrintView } from './PrintView'
import { patientHeaderPlugin } from './index'

const defaultConfig = patientHeaderPlugin.defaultConfig
const emptyData = {}

describe('patient-header Renderer', () => {
  it('renders without crashing with empty data', () => {
    render(
      <Renderer
        instanceId="test-1"
        config={defaultConfig}
        data={emptyData}
        onDataChange={() => {}}
        mode="live"
      />
    )
  })

  it('shows field values when data provided', () => {
    render(
      <Renderer
        instanceId="test-2"
        config={defaultConfig}
        data={{ room: '4B', patient: 'J.D.', age: 45, sex: 'M' }}
        onDataChange={() => {}}
        mode="live"
      />
    )
    expect(screen.getByDisplayValue('4B')).toBeInTheDocument()
    expect(screen.getByDisplayValue('J.D.')).toBeInTheDocument()
  })

  it('shows placeholder values in build mode', () => {
    render(
      <Renderer
        instanceId="test-3"
        config={defaultConfig}
        data={emptyData}
        onDataChange={() => {}}
        mode="build"
      />
    )
    expect(screen.getByPlaceholderText('Room')).toBeInTheDocument()
  })
})

describe('patient-header PrintView', () => {
  it('renders without crashing', () => {
    render(<PrintView config={defaultConfig} data={{ room: '4B', patient: 'J.D.' }} />)
  })
})
