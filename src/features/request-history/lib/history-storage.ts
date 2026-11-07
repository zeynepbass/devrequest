import { readStorage, removeStorage, writeStorage } from '@/lib/storage'
import { historySchema, type HistoryEntry } from './history-schema'

export const HISTORY_STORAGE_KEY = 'devrequest:history'
export const HISTORY_LIMIT = 50

export function loadHistory(): HistoryEntry[] {
  const raw = readStorage(HISTORY_STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = historySchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data.entries : []
  } catch {
    return []
  }
}

export function saveHistory(entries: HistoryEntry[]): boolean {
  if (entries.length === 0) {
    removeStorage(HISTORY_STORAGE_KEY)
    return true
  }
  return writeStorage(HISTORY_STORAGE_KEY, JSON.stringify({ version: 1, entries: entries.slice(0, HISTORY_LIMIT) }))
}
