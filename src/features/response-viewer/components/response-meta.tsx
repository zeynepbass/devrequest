import { ClockIcon, HardDriveDownloadIcon, Repeat2Icon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { HttpResponse } from '@/types/response'
import { formatBytes, formatDuration } from '@/utils/format'
import { StatusBadge } from './status-badge'

interface ResponseMetaProps {
  response: HttpResponse
}

export function ResponseMeta({ response }: ResponseMetaProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
      <StatusBadge status={response.status} statusText={response.statusText} />
      <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
        <ClockIcon className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Duration</span>
        <span data-testid="response-duration" className="text-foreground tabular-nums">
          {formatDuration(response.durationMs)}
        </span>
      </span>
      <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
        <HardDriveDownloadIcon className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Size</span>
        <span data-testid="response-size" className="text-foreground tabular-nums">
          {formatBytes(response.sizeBytes)}
        </span>
      </span>
      {response.redirected ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              className="inline-flex items-center gap-1 rounded text-xs text-status-redirect outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <Repeat2Icon className="size-3.5" aria-hidden="true" />
              Redirected
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-80 font-mono break-all">{response.url}</TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}
