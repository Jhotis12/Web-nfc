import { useState } from 'react'
import './App.css'
import { ChipDetail } from './components/ChipDetail'
import { ChipList } from './components/ChipList'
import { ScanPanel } from './components/ScanPanel'
import { useChips } from './hooks/useChips'
import { useNfc } from './hooks/useNfc'

export default function App() {
  const { cards, recordReading } = useChips()
  const nfc = useNfc((reading) => {
    void recordReading(reading)
  })
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
    </main>
  )
}
