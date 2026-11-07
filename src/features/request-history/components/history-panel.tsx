import { HistoryIcon, SearchIcon, SearchXIcon } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import type { HistoryEntry } from '../lib/history-schema'
import { ClearHistoryDialog } from './clear-history-dialog'
import { HistoryItem } from './history-item'

interface HistoryPanelProps {
  entries: HistoryEntry[]
  onOpen: (entry: HistoryEntry) => void
  onRemove: (id: string) => void
  onClear: () => void
}

export function HistoryPanel({ entries, onOpen, onRemove, onClear }: HistoryPanelProps) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const filtered = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase()
    if (!needle) {
      return entries
    }
    return entries.filter(
      (entry) => entry.request.url.toLowerCase().includes(needle) || entry.request.method.toLowerCase() === needle,
    )
  }, [entries, deferredQuery])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-11 shrink-0 items-center gap-2 border-b px-3">
        <h2 className="text-sm font-semibold">History</h2>
        <span className="rounded-sm bg-muted px-1.5 font-mono text-[10px] leading-4 text-muted-foreground tabular-nums">
          {entries.length}
        </span>
        <div className="ml-auto">
          <ClearHistoryDialog count={entries.length} onConfirm={onClear} />
        </div>
      </div>
      {entries.length > 0 ? (
        <div className="shrink-0 border-b p-2">
          <label className="relative block">
            <span className="sr-only">Filter history</span>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              placeholder="Filter by URL or method"
              onChange={(event) => setQuery(event.target.value)}
              className="h-8 w-full rounded-md border bg-surface-sunken pr-2 pl-8 text-[13px] outline-none placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
            />
          </label>
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <EmptyState
            icon={<HistoryIcon />}
            title="No requests yet"
            description="Sent requests are saved here without their credentials."
          />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<SearchXIcon />} title="No matches" description={`Nothing matches "${deferredQuery}".`} />
        ) : (
          <ul aria-label="Saved requests" className="flex flex-col gap-0.5 p-1.5">
            {filtered.map((entry) => (
              <HistoryItem key={entry.id} entry={entry} onOpen={onOpen} onRemove={onRemove} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
