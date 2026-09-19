import { describe, expect, it } from 'vitest'
import { normalizeRecord, normalizeRecords } from './ndef'

function dataView(text: string): DataView {
  const bytes = new TextEncoder().encode(text)
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
}

function makeRecord(partial: Partial<NDEFRecord>): NDEFRecord {
  return { recordType: 'text', data: undefined, ...partial } as NDEFRecord
}

describe('normalizeRecord', () => {
  it('decodes a text record using its encoding', () => {
    const result = normalizeRecord(
      makeRecord({ recordType: 'text', encoding: 'utf-8', data: dataView('hola') }),
    )
    expect(result).toEqual({ kind: 'text', label: 'Texto', value: 'hola' })
  })

  it('decodes a url record', () => {
    const result = normalizeRecord(
      makeRecord({ recordType: 'url', data: dataView('https://example.com') }),
    )
    expect(result.kind).toBe('url')
    expect(result.value).toBe('https://example.com')
  })

  it('parses a JSON mime record', () => {
    const result = normalizeRecord(
      makeRecord({
        recordType: 'mime',
        mediaType: 'application/json',
        data: dataView('{"id":1}'),
      }),
    )
    expect(result.kind).toBe('json')
    expect(result.value).toBe('{\n  "id": 1\n}')
  })

  it('keeps raw text when a JSON mime record is not valid JSON', () => {
    const result = normalizeRecord(
      makeRecord({
        recordType: 'mime',
        mediaType: 'application/json',
        data: dataView('not-json'),
      }),
    )
    expect(result.kind).toBe('json')
    expect(result.value).toBe('not-json')
  })

  it('keeps unknown record types without failing', () => {
    const result = normalizeRecord(
      makeRecord({ recordType: 'android.com:pkg', data: dataView('com.example') }),
    )
    expect(result.kind).toBe('unknown')
    expect(result.label).toBe('android.com:pkg')
  })

  it('tolerates records without data', () => {
    const result = normalizeRecord(makeRecord({ recordType: 'text', data: undefined }))
    expect(result.value).toBe('')
  })
})

describe('normalizeRecords', () => {
  it('normalizes every record in a message', () => {
    const records = normalizeRecords([
      makeRecord({ recordType: 'text', data: dataView('a') }),
      makeRecord({ recordType: 'url', data: dataView('https://b.test') }),
    ])
    expect(records).toHaveLength(2)
    expect(records.map((record) => record.kind)).toEqual(['text', 'url'])
  })
})
