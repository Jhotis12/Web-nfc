import { get, keys, set } from 'idb-keyval'
import type { ChipCard, ChipReading } from '../types'
import { deriveChipKey, mergeCard, sortCards } from './cards'

export async function saveReading(
  reading: ChipReading,
  now: number = Date.now(),
): Promise<ChipCard> {
  const key = deriveChipKey(reading.serialNumber, reading.records)
  const existing = await get<ChipCard>(key)
  const card = mergeCard(existing, reading, key, now)
  await set(key, card)
  return card
}

export async function listCards(): Promise<ChipCard[]> {
  const allKeys = await keys()
  const values = await Promise.all(allKeys.map((key) => get<ChipCard>(key)))
  const cards = values.filter((value): value is ChipCard => Boolean(value))
  return sortCards(cards)
}
