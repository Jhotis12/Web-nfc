import type { DiagnosticsEnv, LogEntry } from '../lib/diagnostics'
import { formatTime } from '../lib/format'

type DiagnosticsPanelProps = {
  env: DiagnosticsEnv
  logs: LogEntry[]
  onClear: () => void
}

export function DiagnosticsPanel({
  env,
  logs,
  onClear,
}: DiagnosticsPanelProps) {
  const copyLog = () => {
    const header = [
      `secureContext=${env.secureContext}`,
      `protocol=${env.protocol}`,
      `hasNdefReader=${env.hasNdefReader}`,
      `permission=${env.permission}`,
    ].join('\n')
    const lines = logs.map(
      (entry) =>
        `${new Date(entry.time).toISOString()} [${entry.level}] ${entry.message}`,
    )
    const text = [header, '', ...lines].join('\n')
    void navigator.clipboard?.writeText(text)
  }

  return (
    <details className="diag">
      <summary className="diag__summary">Diagnóstico</summary>

      <ul className="diag__env">
        <li>
          <span>HTTPS</span>
          <span>{env.secureContext ? `sí (${env.protocol})` : 'no'}</span>
        </li>
        <li>
          <span>NDEFReader</span>
          <span>{env.hasNdefReader ? 'disponible' : 'no disponible'}</span>
        </li>
        <li>
          <span>Permiso NFC</span>
          <span>{env.permission}</span>
        </li>
      </ul>

      <div className="diag__actions">
        <button type="button" onClick={copyLog}>
          Copiar
        </button>
        <button type="button" onClick={onClear}>
          Limpiar
        </button>
      </div>

      {logs.length === 0 ? (
        <p className="diag__empty">Sin eventos todavía.</p>
      ) : (
        <ol className="diag__log">
          {logs.map((entry) => (
            <li
              key={entry.id}
              className={`diag__entry diag__entry--${entry.level}`}
            >
              <span className="diag__time">{formatTime(entry.time)}</span>
              <span className="diag__msg">{entry.message}</span>
            </li>
          ))}
        </ol>
      )}
    </details>
  )
}
