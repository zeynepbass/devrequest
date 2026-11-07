import { getStatusText, getStatusTone, STATUS_TONE_CLASS } from '@/lib/http-status'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: number
  statusText?: string
}

export function StatusBadge({ status, statusText }: StatusBadgeProps) {
  return (
    <span
      data-testid="response-status"
      className={cn(
        'inline-flex h-6 items-center gap-1.5 rounded-md px-2 font-mono text-xs font-semibold ring-1 ring-inset',
        STATUS_TONE_CLASS[getStatusTone(status)],
      )}
    >
      <span className="tabular-nums">{status}</span>
      <span className="font-sans font-medium">{getStatusText(status, statusText)}</span>
    </span>
  )
}
