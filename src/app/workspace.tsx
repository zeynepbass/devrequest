import { FilePlus2Icon, HistoryIcon, KeyboardIcon } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { AppHeader } from '@/components/layout/app-header'
import { AppShell } from '@/components/layout/app-shell'
import { HistorySidebar } from '@/components/layout/history-sidebar'
import { ShortcutsDialog } from '@/components/layout/shortcuts-dialog'
import { WorkspaceLayout } from '@/components/layout/workspace-layout'
import { IconButton } from '@/components/shared/icon-button'
import { ExampleRequests } from '@/features/request-builder/components/example-requests'
import { RequestBar } from '@/features/request-builder/components/request-bar'
import { RequestTabs } from '@/features/request-builder/components/request-tabs'
import { SendButton } from '@/features/request-builder/components/send-button'
import { useRequestDraft } from '@/features/request-builder/hooks/use-request-draft'
import { HistoryPanel } from '@/features/request-history/components/history-panel'
import { useRequestHistory } from '@/features/request-history/hooks/use-request-history'
import type { HistoryEntry } from '@/features/request-history/lib/history-schema'
import { restoreRequest } from '@/features/request-history/lib/sanitize'
import { ResponsePanel } from '@/features/response-viewer/components/response-panel'
import { useRequestExecution } from '@/hooks/use-request-execution'
import { useTheme } from '@/hooks/use-theme'
import { getShortcutKeys } from '@/lib/shortcuts'
import type { RequestDraft } from '@/types/http'
import type { RequestErrorKind } from '@/types/response'
import { useHistoryVisibility } from './hooks/use-history-visibility'
import { useWorkspaceHotkeys } from './hooks/use-workspace-hotkeys'

const RECORDED_ERRORS: ReadonlySet<RequestErrorKind> = new Set(['network', 'offline', 'timeout'])

export function Workspace() {
  const { draft, actions } = useRequestDraft()
  const { state, isLoading, send, cancel, reset: resetExecution } = useRequestExecution()
  const { entries, record, remove, clear } = useRequestHistory()
  const historyPanel = useHistoryVisibility()
  const { toggleTheme } = useTheme()
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const urlInputRef = useRef<HTMLInputElement>(null)

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

  const loadDraft = useCallback(
    (next: RequestDraft) => {
      actions.load(next)
      resetExecution()
      urlInputRef.current?.focus()
    },
    [actions, resetExecution],
  )

  const handleNewRequest = useCallback(() => {
    actions.reset()
    resetExecution()
    urlInputRef.current?.focus()
  }, [actions, resetExecution])

  const { closeOnMobile } = historyPanel
  const handleOpenHistory = useCallback(
    (entry: HistoryEntry) => {
      loadDraft(restoreRequest(entry.request))
      closeOnMobile()
      if (entry.request.authType !== 'none') {
        toast.info('Credentials are not stored in history. Re-enter them in the Authorization tab.')
      }
    },
    [loadDraft, closeOnMobile],
  )

  const handleClearHistory = useCallback(() => {
    clear()
    toast.success('History cleared')
  }, [clear])

  const showShortcuts = useCallback(() => setShortcutsOpen(true), [])
  const triggerSend = useCallback(() => void handleSend(), [handleSend])

  useWorkspaceHotkeys({
    urlInputRef,
    isLoading,
    send: triggerSend,
    cancel,
    newRequest: handleNewRequest,
    toggleHistory: historyPanel.toggle,
    toggleTheme,
    showShortcuts,
  })

  return (
    <AppShell
      header={
        <AppHeader
          actions={
            <>
              <IconButton
                label={historyPanel.open ? 'Hide history' : 'Show history'}
                shortcut={getShortcutKeys('history')}
                icon={<HistoryIcon />}
                aria-pressed={historyPanel.open}
                onClick={historyPanel.toggle}
              />
              <IconButton
                label="New request"
                shortcut={getShortcutKeys('new')}
                icon={<FilePlus2Icon />}
                onClick={handleNewRequest}
              />
              <IconButton
                label="Keyboard shortcuts"
                shortcut={getShortcutKeys('help')}
                icon={<KeyboardIcon />}
                className="hidden sm:inline-flex"
                onClick={showShortcuts}
              />
            </>
          }
        />
      }
      sidebar={
        <HistorySidebar isDesktop={historyPanel.isDesktop} open={historyPanel.open} onOpenChange={historyPanel.setOpen}>
          <HistoryPanel
            entries={entries}
            onOpen={handleOpenHistory}
            onRemove={remove}
            onClear={handleClearHistory}
            onClose={historyPanel.isDesktop ? undefined : closeOnMobile}
          />
        </HistorySidebar>
      }
    >
      <WorkspaceLayout
        toolbar={
          <RequestBar
            method={draft.method}
            url={draft.url}
            urlInputRef={urlInputRef}
            invalid={state.status === 'error' && state.error.kind === 'invalid-url'}
            onMethodChange={actions.setMethod}
            onUrlChange={actions.setUrl}
            onSubmit={triggerSend}
            actions={<SendButton loading={isLoading} onCancel={cancel} />}
          />
        }
        request={<RequestTabs draft={draft} actions={actions} />}
        response={
          <ResponsePanel
            state={state}
            onCancel={cancel}
            onRetry={triggerSend}
            idleAction={<ExampleRequests onSelect={loadDraft} />}
          />
        }
      />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </AppShell>
  )
}
