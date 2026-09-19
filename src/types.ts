export type RecordKind = 'text' | 'url' | 'json' | 'unknown'

export type DecodedRecord = {
  kind: RecordKind
  label: string
  value: string
}

export type ChipReading = {
  serialNumber: string
  records: DecodedRecord[]
}

export type ChipCard = {
  key: string
  serialNumber: string
  firstSeen: number
  lastSeen: number
  readCount: number
  records: DecodedRecord[]
}
