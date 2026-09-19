// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ScanPanel } from './ScanPanel'

afterEach(cleanup)

describe('ScanPanel', () => {
  it('shows the unavailable message when Web NFC is not supported', () => {
    render(
      <ScanPanel
        support="unavailable"
        scanning={false}
        error={null}
        startScan={vi.fn()}
        stopScan={vi.fn()}
      />,
    )
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(
      true,
    )
    expect(
      screen.getByText(/solo funciona en Chrome para Android/i),
    ).toBeTruthy()
  })

  it('starts scanning on user gesture', () => {
    const startScan = vi.fn()
    render(
      <ScanPanel
        support="available"
        scanning={false}
        error={null}
        startScan={startScan}
        stopScan={vi.fn()}
      />,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(startScan).toHaveBeenCalledTimes(1)
  })

  it('offers to stop while scanning', () => {
    const stopScan = vi.fn()
    render(
      <ScanPanel
        support="available"
        scanning
        error={null}
        startScan={vi.fn()}
        stopScan={stopScan}
      />,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(stopScan).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/Acerca el chip/i)).toBeTruthy()
  })

  it('shows an error alert', () => {
    render(
      <ScanPanel
        support="available"
        scanning={false}
        error="Permiso NFC denegado."
        startScan={vi.fn()}
        stopScan={vi.fn()}
      />,
    )
    expect(screen.getByRole('alert').textContent).toMatch(/Permiso NFC/i)
  })
})
