import { FilePlus2Icon, HistoryIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/app-header'
import { AppShell } from '@/components/layout/app-shell'
import { HistorySidebar } from '@/components/layout/history-sidebar'
import { WorkspaceLayout } from '@/components/layout/workspace-layout'
import { IconButton } from '@/components/shared/icon-button'
import { RequestBar } from '@/features/request-builder/components/request-bar'
import { RequestTabs } from '@/features/request-builder/components/request-tabs'
import { SendButton } from '@/features/request-builder/components/send-button'
import { useRequestDraft } from '@/features/request-builder/hooks/use-request-draft'
import { HistoryPanel } from '@/features/request-history/components/history-panel'
import { useRequestHistory } from '@/features/request-history/hooks/use-request-history'
import type { HistoryEntry } from '@/features/request-history/lib/history-schema'
import { restoreRequest } from '@/features/request-history/lib/sanitize'
import { ResponsePanel } from '@/features/response-viewer/components/response-panel'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useRequestExecution } from '@/hooks/use-request-execution'
import type { RequestErrorKind } from '@/types/response'

const RECORDED_ERRORS: ReadonlySet<RequestErrorKind> = new Set(['network', 'offline', 'timeout'])

export function Workspace() {
  const { draft, actions } = useRequestDraft()
  const execution = useRequestExecution()
  const history = useRequestHistory()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [desktopHistoryOpen, setDesktopHistoryOpen] = useState(true)
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false)

  const { send, reset: resetExecution } = execution
  const { record } = history

  const handleSend = useCallback(async () => {
    const result = await send(draft)
    if (result.duplicate) {
      toast.info('A request is already in progress.')
      return
    }
    const { outcome } = result
    if (outcome.ok) {
      record(draft, { ok: true, status: outcome.response.status, durationMs: outcome.response.durationMs })
    } else if (RECORDED_ERRORS.has(outcome.error.kind)) {
      record(draft, { ok: false, errorTitle: outcome.error.title })
    }
  }, [draft, send, record])

  const handleNewRequest = useCallback(() => {
    actions.reset()
    resetExecution()
  }, [actions, resetExecution])

  const handleOpenHistory = useCallback(
    (entry: HistoryEntry) => {
      actions.load(restoreRequest(entry.request))
      resetExecution()
      setMobileHistoryOpen(false)
      if (entry.request.authType !== 'none') {
        toast.info('Credentials are not stored in history. Re-enter them in the Authorization tab.')
      }
    },
    [actions, resetExecution],
  )

  const historyOpen = isDesktop ? desktopHistoryOpen : mobileHistoryOpen

  function toggleHistory() {
    if (isDesktop) {
      setDesktopHistoryOpen((current) => !current)
    } else {
      setMobileHistoryOpen((current) => !current)
    }
  }

  return (
    <AppShell
      header={
        <AppHeader
          actions={
            <>
              <IconButton
                label={historyOpen ? 'Hide history' : 'Show history'}
                icon={<HistoryIcon />}
                aria-pressed={historyOpen}
                onClick={toggleHistory}
              />
              <IconButton label="New request" icon={<FilePlus2Icon />} onClick={handleNewRequest} />
            </>
          }
        />
      }
      sidebar={
        <HistorySidebar
          isDesktop={isDesktop}
          open={historyOpen}
          onOpenChange={isDesktop ? setDesktopHistoryOpen : setMobileHistoryOpen}
        >
          <HistoryPanel
            entries={history.entries}
            onOpen={handleOpenHistory}
            onRemove={history.remove}
            onClear={history.clear}
          />
        </HistorySidebar>
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
        response={<ResponsePanel state={execution.state} onCancel={execution.cancel} onRetry={handleSend} />}
      />
    </AppShell>
  )
}
