import { XIcon } from 'lucide-react'
import { memo } from 'react'
import { MethodBadge } from '@/components/shared/method-badge'
import { getStatusTone } from '@/lib/http-status'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/utils/format'
import { formatRelativeTime } from '@/utils/time'
import type { HistoryEntry } from '../lib/history-schema'

const TONE_TEXT = {
  info: 'text-muted-foreground',
  success: 'text-status-success',
  redirect: 'text-status-redirect',
  client: 'text-status-client',
  server: 'text-status-server',
} as const

function describeUrl(url: string): { primary: string; secondary: string } {
  try {
    const parsed = new URL(url)
    return { primary: `${parsed.pathname}${parsed.search}` || '/', secondary: parsed.host }
  } catch {
    return { primary: url || 'Untitled request', secondary: '' }
  }
}

interface HistoryItemProps {
  entry: HistoryEntry
  onOpen: (entry: HistoryEntry) => void
  onRemove: (id: string) => void
}

export const HistoryItem = memo(function HistoryItem({ entry, onOpen, onRemove }: HistoryItemProps) {
  const { primary, secondary } = describeUrl(entry.request.url)
  const time = new Date(entry.savedAt)

  return (
    <li className="group relative">
      <button
        type="button"
        onClick={() => onOpen(entry)}
        className="flex w-full flex-col gap-1 rounded-md px-2.5 py-2 pr-9 text-left transition-colors outline-none hover:bg-accent focus-visible:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        <span className="flex min-w-0 items-center gap-2">
          <MethodBadge method={entry.request.method} className="w-9 shrink-0" />
          <span className="truncate font-mono text-[12.5px]" title={entry.request.url}>
            {primary}
          </span>
        </span>
        <span className="flex min-w-0 items-center gap-2 pl-11 text-[11px] text-muted-foreground">
          {entry.result.ok ? (
            <span className={cn('font-mono font-semibold', TONE_TEXT[getStatusTone(entry.result.status)])}>
              {entry.result.status}
            </span>
          ) : (
            <span className="font-medium text-destructive">{entry.result.errorTitle}</span>
          )}
          {entry.result.ok ? <span className="font-mono">{formatDuration(entry.result.durationMs)}</span> : null}
          {secondary ? <span className="truncate">{secondary}</span> : null}
          <time dateTime={time.toISOString()} title={time.toLocaleString()} className="ml-auto shrink-0">
            {formatRelativeTime(entry.savedAt)}
          </time>
        </span>
      </button>
      <button
        type="button"
        aria-label={`Remove ${entry.request.method} ${primary} from history`}
        onClick={() => onRemove(entry.id)}
        className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity outline-none group-hover:opacity-100 hover:bg-background hover:text-destructive focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50 [@media(hover:none)]:opacity-100"
      >
        <XIcon className="size-3.5" />
      </button>
    </li>
  )
})
