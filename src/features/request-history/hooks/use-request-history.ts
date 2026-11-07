import { useCallback, useEffect, useState } from 'react'
import type { RequestDraft } from '@/types/http'
import { createId } from '@/utils/id'
import type { HistoryEntry, HistoryResult } from '../lib/history-schema'
import { HISTORY_LIMIT, HISTORY_STORAGE_KEY, loadHistory, saveHistory } from '../lib/history-storage'
import { sanitizeRequest } from '../lib/sanitize'

export function useRequestHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory)

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === HISTORY_STORAGE_KEY || event.key === null) {
        setEntries(loadHistory())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const commit = useCallback((update: (current: HistoryEntry[]) => HistoryEntry[]) => {
    setEntries((current) => {
      const next = update(current)
      saveHistory(next)
      return next
    })
  }, [])

  const record = useCallback(
    (draft: RequestDraft, result: HistoryResult) => {
      const entry: HistoryEntry = {
        id: createId(),
        savedAt: Date.now(),
        request: sanitizeRequest(draft),
        result,
      }
      commit((current) => [entry, ...current].slice(0, HISTORY_LIMIT))
    },
    [commit],
  )

  const remove = useCallback(
    (id: string) => commit((current) => current.filter((entry) => entry.id !== id)),
    [commit],
  )

  const clear = useCallback(() => commit(() => []), [commit])

  return { entries, record, remove, clear }
}
