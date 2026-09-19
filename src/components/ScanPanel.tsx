import type { NfcState } from '../hooks/useNfc'

type ScanPanelProps = Pick<
  NfcState,
  'support' | 'scanning' | 'error' | 'startScan' | 'stopScan'
>

export function ScanPanel({
  support,
  scanning,
  error,
  startScan,
  stopScan,
}: ScanPanelProps) {
  const unavailable = support === 'unavailable'

  return (
    <section className="scan">
      <button
        type="button"
        className="scan__button"
        disabled={unavailable}
        onClick={() => {
          void (scanning ? stopScan() : startScan())
        }}
      >
        {scanning ? 'Detener escaneo' : 'Escanear chip'}
      </button>
      <p className="scan__hint">
        {unavailable
          ? 'La lectura NFC solo funciona en Chrome para Android.'
          : scanning
            ? 'Acerca el chip a la parte trasera del teléfono.'
            : 'Pulsa el botón y acerca un chip NFC.'}
      </p>
      {error ? (
        <p className="scan__error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}
