import { formatChipLabel, formatDateTime } from '../lib/format'
import type { ChipCard } from '../types'

export function ChipDetail({ card }: { card: ChipCard }) {
  return (
    <section className="detail">
      <h2 className="detail__title">{formatChipLabel(card.serialNumber)}</h2>
      <dl className="detail__meta">
        <div>
          <dt>Serie</dt>
          <dd>{card.serialNumber || '—'}</dd>
        </div>
        <div>
          <dt>Primera lectura</dt>
          <dd>{formatDateTime(card.firstSeen)}</dd>
        </div>
        <div>
          <dt>Última lectura</dt>
          <dd>{formatDateTime(card.lastSeen)}</dd>
        </div>
        <div>
          <dt>Lecturas</dt>
          <dd>{card.readCount}</dd>
        </div>
      </dl>

      {card.records.length === 0 ? (
        <p className="detail__empty">
          Este chip no contiene registros legibles.
        </p>
      ) : (
        <ul className="records">
          {card.records.map((record, index) => (
            <li key={`${record.kind}-${index}`} className="record">
              <span className="record__label">{record.label}</span>
              <span className="record__value">{record.value || '—'}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
