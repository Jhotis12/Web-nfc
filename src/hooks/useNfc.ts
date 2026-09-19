import { useCallback, useEffect, useRef, useState } from 'react'
import { normalizeRecords } from '../lib/ndef'
import type { ChipReading } from '../types'

export type NfcSupport = 'unknown' | 'available' | 'unavailable'

export type NfcState = {
  support: NfcSupport
  scanning: boolean
  error: string | null
  startScan: () => Promise<void>
  stopScan: () => void
}

function describeError(error: unknown): string {
  const name = error instanceof Error ? error.name : undefined
  switch (name) {
    case 'NotAllowedError':
      return 'Permiso NFC denegado. Habilítalo para este sitio en los ajustes de Chrome.'
    case 'NotSupportedError':
      return 'Este dispositivo no tiene hardware NFC disponible.'
    case 'NotReadableError':
      return 'No se pudo acceder al lector NFC.'
    default:
      return error instanceof Error
        ? `No se pudo iniciar el escaneo: ${error.message}`
        : 'No se pudo iniciar el escaneo NFC.'
  }
}

export function useNfc(
  onReading: (reading: ChipReading) => void,
): NfcState {
  const [support, setSupport] = useState<NfcSupport>(() =>
    'NDEFReader' in window ? 'available' : 'unavailable',
  )
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const readerRef = useRef<NDEFReader | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const onReadingRef = useRef(onReading)

  useEffect(() => {
    onReadingRef.current = onReading
  }, [onReading])

  const handleReading = useCallback((event: NDEFReadingEvent) => {
    setError(null)
    onReadingRef.current({
      serialNumber: event.serialNumber ?? '',
      records: normalizeRecords(event.message.records),
    })
  }, [])

  const handleReadingError = useCallback(() => {
    setError('No se pudo leer el chip. Acerca otro chip o inténtalo de nuevo.')
  }, [])

  const startScan = useCallback(async () => {
    if (!('NDEFReader' in window)) {
      setSupport('unavailable')
      setError('Este navegador no soporta la lectura NFC. Usa Chrome en Android.')
      return
    }
    try {
      const reader = new NDEFReader()
      const controller = new AbortController()
      reader.onreading = handleReading
      reader.onreadingerror = handleReadingError
      await reader.scan({ signal: controller.signal })
      readerRef.current = reader
      controllerRef.current = controller
      setScanning(true)
      setError(null)
    } catch (scanError) {
      setScanning(false)
      setError(describeError(scanError))
    }
  }, [handleReading, handleReadingError])

  const stopScan = useCallback(() => {
    controllerRef.current?.abort()
    controllerRef.current = null
    readerRef.current = null
    setScanning(false)
  }, [])

  useEffect(() => {
    const onVisibilityChange = () => {
      const reader = readerRef.current
      const controller = controllerRef.current
      if (
        document.visibilityState === 'visible' &&
        reader &&
        controller &&
        !controller.signal.aborted
      ) {
        reader.scan({ signal: controller.signal }).catch((resumeError) => {
          setError(describeError(resumeError))
        })
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  useEffect(() => stopScan, [stopScan])

  return { support, scanning, error, startScan, stopScan }
}
