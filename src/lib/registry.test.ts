import 'fake-indexeddb/auto'
import { clear } from 'idb-keyval'
import { beforeEach, describe, expect, it } from 'vitest'
import type { ChipReading } from '../types'
import { listCards, saveReading } from './registry'

const reading = (serialNumber: string, value: string): ChipReading => ({
  serialNumber,
  records: [{ kind: 'text', label: 'Texto', value }],
})

beforeEach(async () => {
  await clear()
})

describe('saveReading', () => {
  it('creates a card on the first read and updates it on a repeat read', async () => {
    await saveReading(reading('abc', 'uno'), 1000)
    await saveReading(reading('abc', 'dos'), 2000)

    const cards = await listCards()
    expect(cards).toHaveLength(1)
    expect(cards[0]).toMatchObject({
      serialNumber: 'abc',
      firstSeen: 1000,
      lastSeen: 2000,
      readCount: 2,
    })
    expect(cards[0].records[0].value).toBe('dos')
  })

  it('keeps one card per different chip', async () => {
    await saveReading(reading('abc', 'uno'), 1000)
    await saveReading(reading('xyz', 'dos'), 1500)

    const cards = await listCards()
    expect(cards.map((card) => card.serialNumber).sort()).toEqual([
      'abc',
      'xyz',
    ])
  })

  it('stores cards so they can be read back from the database', async () => {
    await saveReading(reading('abc', 'uno'), 1000)
    const firstRead = await listCards()
    const secondRead = await listCards()
    expect(secondRead).toEqual(firstRead)
    expect(secondRead).toHaveLength(1)
  })

  it('groups chips without a serial number by content', async () => {
    await saveReading(reading('', 'igual'), 1000)
    await saveReading(reading('', 'igual'), 2000)
    await saveReading(reading('', 'distinto'), 3000)

    const cards = await listCards()
    expect(cards).toHaveLength(2)
  })
})
