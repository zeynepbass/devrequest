import { BanIcon, CircleAlertIcon, RotateCwIcon, ShieldAlertIcon, TimerOffIcon, WifiOffIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import type { RequestError, RequestErrorKind } from '@/types/response'
import { formatDuration } from '@/utils/format'

const ICONS: Partial<Record<RequestErrorKind, ReactNode>> = {
  timeout: <TimerOffIcon />,
  offline: <WifiOffIcon />,
  aborted: <BanIcon />,
  'mixed-content': <ShieldAlertIcon />,
  network: <ShieldAlertIcon />,
}

const RETRYABLE: ReadonlySet<RequestErrorKind> = new Set(['network', 'offline', 'timeout', 'aborted'])

interface ResponseErrorProps {
  error: RequestError
  onRetry: () => void
}

export function ResponseError({ error, onRetry }: ResponseErrorProps) {
  const muted = error.kind === 'aborted'

  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center p-6 sm:p-8">
      <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
        <div
          className={
            muted
              ? 'flex size-11 items-center justify-center rounded-xl border bg-surface-raised text-muted-foreground [&_svg]:size-5'
              : 'flex size-11 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10 text-destructive [&_svg]:size-5'
          }
        >
          {ICONS[error.kind] ?? <CircleAlertIcon />}
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold">{error.title}</p>
          <p className="text-sm break-words text-muted-foreground">{error.message}</p>
          {error.durationMs !== undefined && error.kind !== 'aborted' ? (
            <p className="font-mono text-xs text-muted-foreground">after {formatDuration(error.durationMs)}</p>
          ) : null}
        </div>
        {error.hints.length > 0 ? (
          <ul className="w-full space-y-1.5 rounded-lg border bg-surface p-3 text-left text-xs text-muted-foreground">
            {error.hints.map((hint) => (
              <li key={hint} className="flex gap-2">
                <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
                {hint}
              </li>
            ))}
          </ul>
        ) : null}
        {RETRYABLE.has(error.kind) ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCwIcon />
            Send again
          </Button>
        ) : null}
      </div>
    </div>
  )
}
