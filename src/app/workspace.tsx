import { FilePlus2Icon, RadioTowerIcon } from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { AppShell } from '@/components/layout/app-shell'
import { WorkspaceLayout } from '@/components/layout/workspace-layout'
import { EmptyState } from '@/components/shared/empty-state'
import { IconButton } from '@/components/shared/icon-button'
import { RequestBar } from '@/features/request-builder/components/request-bar'
import { RequestTabs } from '@/features/request-builder/components/request-tabs'
import { useRequestDraft } from '@/features/request-builder/hooks/use-request-draft'

export function Workspace() {
  const { draft, actions } = useRequestDraft()

  return (
    <AppShell
      header={
        <AppHeader
          actions={<IconButton label="New request" icon={<FilePlus2Icon />} onClick={actions.reset} />}
        />
      }
    >
      <WorkspaceLayout
        toolbar={
          <RequestBar
            method={draft.method}
            url={draft.url}
            onMethodChange={actions.setMethod}
            onUrlChange={actions.setUrl}
          />
        }
        request={<RequestTabs draft={draft} actions={actions} />}
        response={
          <EmptyState
            icon={<RadioTowerIcon />}
            title="No response yet"
            description="Responses appear here once a request is sent."
          />
        }
      />
    </AppShell>
  )
}
