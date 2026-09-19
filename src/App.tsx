import { useState } from 'react'
import './App.css'
import { ChipDetail } from './components/ChipDetail'
import { ChipList } from './components/ChipList'
import { DiagnosticsPanel } from './components/DiagnosticsPanel'
import { ScanPanel } from './components/ScanPanel'
import { useChips } from './hooks/useChips'
import { useDiagnostics } from './hooks/useDiagnostics'
import { useNfc } from './hooks/useNfc'

export default function App() {
  const { cards, recordReading } = useChips()
  const diagnostics = useDiagnostics()
  const nfc = useNfc((reading) => {
    recordReading(reading).catch((error: unknown) => {
      diagnostics.log(
        'error',
        `No se pudo guardar la ficha: ${
          error instanceof Error ? error.message : String(error)
        }`,
      )
    })
  }, diagnostics.log)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const selected =
    cards.find((card) => card.key === selectedKey) ?? cards[0] ?? null

  return (
    <main className="app">
      <header className="app__header">
        <h1>Lector NFC</h1>
        <p>Escanea chips y guarda su contenido en este dispositivo.</p>
      </header>

      <ScanPanel {...nfc} />

      <section className="app__saved">
        <h2 className="app__subtitle">Chips guardados</h2>
        <ChipList
          cards={cards}
          selectedKey={selected?.key ?? null}
          onSelect={setSelectedKey}
        />
      </section>

      {selected ? <ChipDetail card={selected} /> : null}

      <DiagnosticsPanel
        env={diagnostics.env}
        logs={diagnostics.logs}
        onClear={diagnostics.clear}
      />
    </main>
  )
}
