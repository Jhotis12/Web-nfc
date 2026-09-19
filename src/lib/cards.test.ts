import { describe, expect, it } from 'vitest'
import type { ChipCard, ChipReading } from '../types'
import { deriveChipKey, mergeCard, sortCards } from './cards'

const reading: ChipReading = {
  serialNumber: '04a1b2c3',
  records: [{ kind: 'text', label: 'Texto', value: 'hola' }],
}

describe('deriveChipKey', () => {
  it('uses the serial number when present', () => {
    expect(deriveChipKey('04a1b2c3', reading.records)).toBe('serial:04a1b2c3')
  })

  it('falls back to content when the serial is empty', () => {
    const first = deriveChipKey('', reading.records)
    const same = deriveChipKey('', reading.records)
    const other = deriveChipKey('', [
      { kind: 'text', label: 'Texto', value: 'adios' },
    ])
    expect(first).toBe(same)
    expect(first).not.toBe(other)
    expect(first.startsWith('content:')).toBe(true)
  })
})

describe('mergeCard', () => {
  it('creates a card on the first read', () => {
    const card = mergeCard(undefined, reading, 'serial:04a1b2c3', 1000)
    expect(card).toMatchObject({
      key: 'serial:04a1b2c3',
      serialNumber: '04a1b2c3',
      firstSeen: 1000,
      lastSeen: 1000,
      readCount: 1,
    })
  })

  it('updates the same card on a repeat read', () => {
    const first = mergeCard(undefined, reading, 'serial:04a1b2c3', 1000)
    const updated = mergeCard(first, reading, 'serial:04a1b2c3', 2000)
    expect(updated.firstSeen).toBe(1000)
    expect(updated.lastSeen).toBe(2000)
    expect(updated.readCount).toBe(2)
    expect(updated.records).toEqual(reading.records)
  })

  it('refreshes records while preserving the first seen time', () => {
    const first = mergeCard(undefined, reading, 'serial:04a1b2c3', 1000)
    const secondReading: ChipReading = {
      serialNumber: '04a1b2c3',
      records: [{ kind: 'text', label: 'Texto', value: 'cambiado' }],
    }
    const updated = mergeCard(first, secondReading, 'serial:04a1b2c3', 2000)
    expect(updated.firstSeen).toBe(1000)
    expect(updated.records[0].value).toBe('cambiado')
  })
})

describe('sortCards', () => {
  it('sorts by most recently seen first', () => {
    const base: ChipCard = {
      key: 'k',
      serialNumber: 's',
      firstSeen: 0,
      lastSeen: 0,
      readCount: 1,
      records: [],
    }
    const sorted = sortCards([
      { ...base, key: 'old', lastSeen: 100 },
      { ...base, key: 'new', lastSeen: 300 },
    ])
    expect(sorted.map((card) => card.key)).toEqual(['new', 'old'])
  })
})
