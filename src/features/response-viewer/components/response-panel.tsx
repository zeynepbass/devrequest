import { AlertTriangleIcon, Loader2Icon, RadioTowerIcon } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import type { ExecutionState } from '@/hooks/use-request-execution'

interface ResponsePanelProps {
  state: ExecutionState
}

export function ResponsePanel({ state }: ResponsePanelProps) {
  switch (state.status) {
    case 'idle':
      return (
        <EmptyState
          icon={<RadioTowerIcon />}
          title="No response yet"
          description="Responses appear here once a request is sent."
        />
      )
    case 'loading':
      return (
        <EmptyState
          icon={<Loader2Icon className="animate-spin" />}
          title="Waiting for response"
          description="The request is in flight."
        />
      )
    case 'error':
      return (
        <EmptyState
          icon={<AlertTriangleIcon className="text-destructive" />}
          title={state.error.title}
          description={state.error.message}
        />
      )
    case 'success':
      return (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b px-4 py-2 font-mono text-xs">
            <span>
              {state.response.status} {state.response.statusText}
            </span>
            <span className="text-muted-foreground">{Math.round(state.response.durationMs)} ms</span>
            <span className="text-muted-foreground">{state.response.sizeBytes} B</span>
          </div>
          <pre className="min-h-0 flex-1 overflow-auto p-4 font-mono text-[13px] whitespace-pre-wrap break-all">
            {state.response.bodyText}
          </pre>
        </div>
      )
  }
}
