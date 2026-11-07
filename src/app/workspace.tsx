import { FilePlus2Icon } from 'lucide-react'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/app-header'
import { AppShell } from '@/components/layout/app-shell'
import { WorkspaceLayout } from '@/components/layout/workspace-layout'
import { IconButton } from '@/components/shared/icon-button'
import { RequestBar } from '@/features/request-builder/components/request-bar'
import { RequestTabs } from '@/features/request-builder/components/request-tabs'
import { SendButton } from '@/features/request-builder/components/send-button'
import { useRequestDraft } from '@/features/request-builder/hooks/use-request-draft'
import { ResponsePanel } from '@/features/response-viewer/components/response-panel'
import { useRequestExecution } from '@/hooks/use-request-execution'

export function Workspace() {
  const { draft, actions } = useRequestDraft()
  const execution = useRequestExecution()
  const { send, reset: resetExecution } = execution

  const handleSend = useCallback(async () => {
    const result = await send(draft)
    if (result.duplicate) {
      toast.info('A request is already in progress.')
    }
  }, [draft, send])

  const handleNewRequest = useCallback(() => {
    actions.reset()
    resetExecution()
  }, [actions, resetExecution])

  return (
    <AppShell
      header={
        <AppHeader actions={<IconButton label="New request" icon={<FilePlus2Icon />} onClick={handleNewRequest} />} />
      }
    >
      <WorkspaceLayout
        toolbar={
          <RequestBar
            method={draft.method}
            url={draft.url}
            invalid={execution.state.status === 'error' && execution.state.error.kind === 'invalid-url'}
            onMethodChange={actions.setMethod}
            onUrlChange={actions.setUrl}
            onSubmit={handleSend}
            actions={<SendButton loading={execution.isLoading} onCancel={execution.cancel} />}
          />
        }
        request={<RequestTabs draft={draft} actions={actions} />}
        response={<ResponsePanel state={execution.state} />}
      />
    </AppShell>
  )
}
