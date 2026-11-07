import { RadioTowerIcon, SlidersHorizontalIcon } from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { AppShell } from '@/components/layout/app-shell'
import { WorkspaceLayout } from '@/components/layout/workspace-layout'
import { EmptyState } from '@/components/shared/empty-state'
import { AppProviders } from './providers/app-providers'

export function App() {
  return (
    <AppProviders>
      <AppShell header={<AppHeader />}>
        <WorkspaceLayout
          toolbar={<h1 className="text-sm font-medium">Untitled request</h1>}
          request={
            <EmptyState
              icon={<SlidersHorizontalIcon />}
              title="Request configuration"
              description="Headers, query parameters, body and authorization live here."
            />
          }
          response={
            <EmptyState
              icon={<RadioTowerIcon />}
              title="No response yet"
              description="Responses appear here once a request is sent."
            />
          }
        />
      </AppShell>
    </AppProviders>
  )
}
