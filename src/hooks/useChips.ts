import { useCallback, useEffect, useState } from 'react'
import { listCards, saveReading } from '../lib/registry'
import type { ChipCard, ChipReading } from '../types'

export type ChipRegistry = {
  cards: ChipCard[]
  loading: boolean
  recordReading: (reading: ChipReading) => Promise<void>
}

export function useChips(): ChipRegistry {
  const [cards, setCards] = useState<ChipCard[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setCards(await listCards())
  }, [])

  useEffect(() => {
    let active = true
    listCards()
      .then((stored) => {
        if (active) {
          setCards(stored)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [])

  const recordReading = useCallback(
    async (reading: ChipReading) => {
      await saveReading(reading)
      await refresh()
    },
    [refresh],
  )

  return { cards, loading, recordReading }
}
