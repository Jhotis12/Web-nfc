export type LogLevel = 'info' | 'success' | 'error'

export type LogEntry = {
  id: number
  time: number
  level: LogLevel
  message: string
}

export type DiagnosticsEnv = {
  secureContext: boolean
  protocol: string
  hasNdefReader: boolean
  permission: string
  userAgent: string
}
