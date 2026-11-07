import { RadioTowerIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { Kbd } from '@/components/shared/kbd'
import type { ExecutionState } from '@/hooks/use-request-execution'
import { ResponseError } from './response-error'
import { ResponseLoading } from './response-loading'
import { ResponseView } from './response-view'

interface ResponsePanelProps {
  state: ExecutionState
  onCancel: () => void
  onRetry: () => void
  idleAction?: ReactNode
}

export function ResponsePanel({ state, onCancel, onRetry, idleAction }: ResponsePanelProps) {
  switch (state.status) {
    case 'idle':
      return (
        <EmptyState
          icon={<RadioTowerIcon />}
          title="No response yet"
          description={
            <span className="inline-flex flex-wrap items-center justify-center gap-1.5">
              Enter a URL and press <Kbd keys={['Mod', 'Enter']} /> to send it.
            </span>
          }
          action={idleAction}
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
