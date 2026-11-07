import { RadioTowerIcon } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import type { ExecutionState } from '@/hooks/use-request-execution'
import { ResponseError } from './response-error'
import { ResponseLoading } from './response-loading'
import { ResponseView } from './response-view'

interface ResponsePanelProps {
  state: ExecutionState
  onCancel: () => void
  onRetry: () => void
}

export function ResponsePanel({ state, onCancel, onRetry }: ResponsePanelProps) {
  switch (state.status) {
    case 'idle':
      return (
        <EmptyState
          icon={<RadioTowerIcon />}
          title="No response yet"
          description="Enter a URL and send the request to inspect the response here."
        />
      )
    case 'loading':
      return <ResponseLoading startedAt={state.startedAt} onCancel={onCancel} />
    case 'error':
      return <ResponseError error={state.error} onRetry={onRetry} />
    case 'success':
      return <ResponseView response={state.response} />
  }
}
