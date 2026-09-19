// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { ChipCard } from './types'

const mocks = vi.hoisted(() => ({
  cards: [] as ChipCard[],
  recordReading: vi.fn(),
}))

vi.mock('./hooks/useChips', () => ({
  useChips: () => ({
    cards: mocks.cards,
    loading: false,
    recordReading: mocks.recordReading,
  }),
}))

vi.mock('./hooks/useNfc', () => ({
  useNfc: () => ({
    support: 'available',
    scanning: false,
    error: null,
    startScan: vi.fn(),
    stopScan: vi.fn(),
  }),
}))

afterEach(cleanup)

const cardA: ChipCard = {
  key: 'serial:aaa',
  serialNumber: 'aaa',
  firstSeen: 0,
  lastSeen: 1000,
  readCount: 2,
  records: [{ kind: 'text', label: 'Texto', value: 'contenido-aaa' }],
}

const cardB: ChipCard = {
  key: 'serial:bbb',
  serialNumber: 'bbb',
  firstSeen: 0,
  lastSeen: 2000,
  readCount: 1,
  records: [{ kind: 'text', label: 'Texto', value: 'contenido-bbb' }],
}

describe('App', () => {
  it('shows the empty state when no chips are saved', () => {
    mocks.cards = []
    render(<App />)
    expect(screen.getByText(/no has leído ningún chip/i)).toBeTruthy()
  })

  it('shows the records of the selected chip', () => {
    mocks.cards = [cardA, cardB]
    render(<App />)
    expect(screen.getByText('contenido-aaa')).toBeTruthy()

    fireEvent.click(screen.getByText('bbb'))
    expect(screen.getByText('contenido-bbb')).toBeTruthy()
  })
})
