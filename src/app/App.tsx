import { AppProviders } from './providers/app-providers'
import { Workspace } from './workspace'

export function App() {
  return (
    <AppProviders>
      <Workspace />
    </AppProviders>
  )
}
