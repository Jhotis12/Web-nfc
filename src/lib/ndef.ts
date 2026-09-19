import type { DecodedRecord } from '../types'

function decode(
  data: DataView | undefined,
  encoding?: string,
): string {
  if (!data) {
    return ''
  }
  try {
    return new TextDecoder(encoding).decode(data)
  } catch {
    return new TextDecoder().decode(data)
  }
}

export function normalizeRecord(record: NDEFRecord): DecodedRecord {
  switch (record.recordType) {
    case 'text':
      return {
        kind: 'text',
        label: 'Texto',
        value: decode(record.data, record.encoding),
      }
    case 'url':
      return {
        kind: 'url',
        label: 'URL',
        value: decode(record.data),
      }
    case 'mime': {
      const mediaType = record.mediaType ?? ''
      const raw = decode(record.data)
      if (mediaType.includes('json')) {
        try {
          return {
            kind: 'json',
            label: mediaType || 'JSON',
            value: JSON.stringify(JSON.parse(raw), null, 2),
          }
        } catch {
          return { kind: 'json', label: mediaType || 'JSON', value: raw }
        }
      }
      return { kind: 'json', label: mediaType || 'MIME', value: raw }
    }
    default:
      return {
        kind: 'unknown',
        label: record.recordType || 'Desconocido',
        value: decode(record.data),
      }
  }
}

export function normalizeRecords(
  records: ReadonlyArray<NDEFRecord>,
): DecodedRecord[] {
  return records.map(normalizeRecord)
}
