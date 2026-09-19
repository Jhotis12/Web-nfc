import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  DiagnosticsEnv,
  LogEntry,
  LogLevel,
} from '../lib/diagnostics'

export type Diagnostics = {
  logs: LogEntry[]
  env: DiagnosticsEnv
  log: (level: LogLevel, message: string) => void
  clear: () => void
}

export function useDiagnostics(): Diagnostics {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const idRef = useRef(0)

  const log = useCallback((level: LogLevel, message: string) => {
    idRef.current += 1
    const entry: LogEntry = {
      id: idRef.current,
      time: Date.now(),
      level,
      message,
    }
    setLogs((previous) => [...previous, entry])
    const method = level === 'error' ? 'error' : 'log'
    console[method](`[NFC] ${message}`)
  }, [])

  const clear = useCallback(() => {
    setLogs([])
  }, [])

  const [env, setEnv] = useState<DiagnosticsEnv>(() => ({
    secureContext:
      typeof window !== 'undefined' ? window.isSecureContext : false,
    protocol: typeof location !== 'undefined' ? location.protocol : '',
    hasNdefReader: typeof window !== 'undefined' && 'NDEFReader' in window,
    permission: 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  }))

  useEffect(() => {
    let cancelled = false
    let status: PermissionStatus | null = null
    const changeHandler = () => {
      if (!cancelled && status) {
        setEnv((previous) => ({ ...previous, permission: status!.state }))
      }
    }

    const permissionQuery = navigator.permissions?.query
      ? navigator.permissions.query({ name: 'nfc' as PermissionName })
      : Promise.reject(new Error('permissions API no disponible'))

    permissionQuery
      .then((result) => {
        if (cancelled) {
          return
        }
        status = result
        setEnv((previous) => ({ ...previous, permission: result.state }))
        result.addEventListener('change', changeHandler)
      })
      .catch(() => {
        if (!cancelled) {
          setEnv((previous) => ({ ...previous, permission: 'unsupported' }))
        }
      })

    return () => {
      cancelled = true
      status?.removeEventListener('change', changeHandler)
    }
  }, [])

  return { logs, env, log, clear }
}
