import { useCallback, useEffect, useRef, useState } from 'react'
import type { LogLevel } from '../lib/diagnostics'
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

type Logger = (level: LogLevel, message: string) => void

const WATCHDOG_DELAY_MS = 12000

function describeError(error: unknown): string {
  const name = error instanceof Error ? error.name : undefined
  switch (name) {
    case 'NotAllowedError':
      return 'Permiso NFC denegado. Habilítalo para este sitio en los ajustes de Chrome.'
    case 'NotSupportedError':
      return 'Este dispositivo no tiene hardware NFC disponible.'
    case 'NotReadableError':
      return 'El NFC parece estar desactivado. Actívalo en los ajustes del teléfono.'
    default:
      return error instanceof Error
        ? `No se pudo iniciar el escaneo: ${error.message}`
        : 'No se pudo iniciar el escaneo NFC.'
  }
}

function errorDetails(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`
  }
  return String(error)
}

export function useNfc(
  onReading: (reading: ChipReading) => void,
  log: Logger,
): NfcState {
  const [support, setSupport] = useState<NfcSupport>(() =>
    'NDEFReader' in window ? 'available' : 'unavailable',
  )
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const readerRef = useRef<NDEFReader | null>(null)
  const controllerRef = useRef<AbortController | null>(null)
  const watchdogRef = useRef<number | null>(null)
  const onReadingRef = useRef(onReading)
  const logRef = useRef(log)

  useEffect(() => {
    onReadingRef.current = onReading
  }, [onReading])

  useEffect(() => {
    logRef.current = log
  }, [log])

  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current !== null) {
      window.clearTimeout(watchdogRef.current)
      watchdogRef.current = null
    }
  }, [])

  const handleReading = useCallback(
    (event: NDEFReadingEvent) => {
      clearWatchdog()
      setError(null)
      try {
        const reading: ChipReading = {
          serialNumber: event.serialNumber ?? '',
          records: normalizeRecords(event.message.records),
        }
        logRef.current(
          'success',
          `Chip detectado. Serie="${reading.serialNumber || '(sin serie)'}" · registros=${reading.records.length}`,
        )
        onReadingRef.current(reading)
      } catch (readError) {
        logRef.current(
          'error',
          `Error procesando la lectura: ${errorDetails(readError)}`,
        )
        setError('Se leyó el chip pero no se pudo procesar la información.')
      }
    },
    [clearWatchdog],
  )

  const handleReadingError = useCallback(() => {
    logRef.current(
      'error',
      'Evento readingerror: el chip no expone NDEF o salió del campo.',
    )
    setError(
      'No se pudo leer el chip. Puede no ser compatible con NDEF o haberse alejado. Prueba otro chip.',
    )
  }, [])

  const startScan = useCallback(async () => {
    logRef.current('info', 'Botón Escanear pulsado.')
    if (!('NDEFReader' in window)) {
      logRef.current('error', 'NDEFReader no existe en window.')
      setSupport('unavailable')
      setError('Este navegador no soporta la lectura NFC. Usa Chrome en Android.')
      return
    }
    if (!window.isSecureContext) {
      logRef.current(
        'error',
        `Contexto no seguro (${location.protocol}). Web NFC requiere HTTPS.`,
      )
    }
    try {
      const reader = new NDEFReader()
      const controller = new AbortController()
      reader.onreading = handleReading
      reader.onreadingerror = handleReadingError
      logRef.current('info', 'Llamando a NDEFReader.scan()...')
      await reader.scan({ signal: controller.signal })
      readerRef.current = reader
      controllerRef.current = controller
      setScanning(true)
      setError(null)
      logRef.current(
        'success',
        'scan() resuelto: escaneo activo. Acerca un chip a la parte trasera del teléfono.',
      )
      clearWatchdog()
      watchdogRef.current = window.setTimeout(() => {
        logRef.current(
          'info',
          'Escaneo activo pero sin lecturas tras 12s. Comprueba que el NFC del teléfono esté encendido y que el chip sea NDEF (tipo 1-5, no MIFARE Classic).',
        )
      }, WATCHDOG_DELAY_MS)
    } catch (scanError) {
      setScanning(false)
      logRef.current('error', `scan() falló: ${errorDetails(scanError)}`)
      setError(describeError(scanError))
    }
  }, [clearWatchdog, handleReading, handleReadingError])

  const stopScan = useCallback(() => {
    logRef.current('info', 'Escaneo detenido por el usuario.')
    controllerRef.current?.abort()
    controllerRef.current = null
    readerRef.current = null
    clearWatchdog()
    setScanning(false)
  }, [clearWatchdog])

  useEffect(() => {
    const onVisibilityChange = () => {
      logRef.current(
        'info',
        `Visibilidad: ${document.visibilityState}.`,
      )
      const reader = readerRef.current
      const controller = controllerRef.current
      if (
        document.visibilityState === 'visible' &&
        reader &&
        controller &&
        !controller.signal.aborted
      ) {
        reader.scan({ signal: controller.signal }).catch((resumeError) => {
          logRef.current(
            'error',
            `No se pudo reanudar el escaneo: ${errorDetails(resumeError)}`,
          )
          setError(describeError(resumeError))
        })
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  useEffect(
    () => () => {
      controllerRef.current?.abort()
      clearWatchdog()
    },
    [clearWatchdog],
  )

  return { support, scanning, error, startScan, stopScan }
}
