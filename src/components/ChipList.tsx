import { formatChipLabel, formatDateTime } from '../lib/format'
import type { ChipCard } from '../types'

type ChipListProps = {
  cards: ChipCard[]
  selectedKey: string | null
  onSelect: (key: string) => void
}

export function ChipList({ cards, selectedKey, onSelect }: ChipListProps) {
  if (cards.length === 0) {
    return (
      <div className="empty">
        <p className="empty__title">Todavía no has leído ningún chip.</p>
        <p className="empty__hint">
          Los chips que escanees aparecerán aquí, uno por chip.
        </p>
      </div>
    )
  }

  return (
    <ul className="chip-list">
      {cards.map((card) => (
        <li key={card.key}>
          <button
            type="button"
            className={
              card.key === selectedKey ? 'chip chip--active' : 'chip'
            }
            aria-pressed={card.key === selectedKey}
            onClick={() => onSelect(card.key)}
          >
            <span className="chip__serial">
              {formatChipLabel(card.serialNumber)}
            </span>
            <span className="chip__meta">
              {card.readCount} lectura{card.readCount === 1 ? '' : 's'} ·{' '}
              {formatDateTime(card.lastSeen)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
