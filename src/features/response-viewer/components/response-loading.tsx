import { XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useElapsedTime } from '@/hooks/use-elapsed-time'
import { formatDuration } from '@/utils/format'

interface ResponseLoadingProps {
  startedAt: number
  onCancel: () => void
}

export function ResponseLoading({ startedAt, onCancel }: ResponseLoadingProps) {
  const elapsed = useElapsedTime(startedAt)

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <div className="relative size-12">
        <span className="absolute inset-0 rounded-full border-2 border-border" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">Waiting for response</p>
        <p className="font-mono text-xs text-muted-foreground tabular-nums">{formatDuration(elapsed)}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onCancel}>
        <XIcon />
        Cancel request
      </Button>
    </div>
  )
}
