import type { ChipCard, ChipReading, DecodedRecord } from '../types'

function contentHash(input: string): string {
  let hash = 5381
  for (let index = 0; index < input.length; index += 1) {
    hash = ((hash << 5) + hash + input.charCodeAt(index)) >>> 0
  }
  return hash.toString(16)
}

export function deriveChipKey(
  serialNumber: string,
  records: DecodedRecord[],
): string {
  const serial = serialNumber.trim()
  if (serial) {
    return `serial:${serial}`
  }
  const fingerprint = records
    .map((record) => `${record.kind}:${record.label}:${record.value}`)
    .join('\n')
  return `content:${contentHash(fingerprint)}`
}

export function mergeCard(
  existing: ChipCard | undefined,
  reading: ChipReading,
  key: string,
  now: number,
): ChipCard {
  if (!existing) {
    return {
      key,
      serialNumber: reading.serialNumber,
      firstSeen: now,
      lastSeen: now,
      readCount: 1,
      records: reading.records,
    }
  }
  return {
    ...existing,
    serialNumber: reading.serialNumber || existing.serialNumber,
    lastSeen: now,
    readCount: existing.readCount + 1,
    records: reading.records,
  }
}

export function sortCards(cards: ChipCard[]): ChipCard[] {
  return [...cards].sort((a, b) => b.lastSeen - a.lastSeen)
}
