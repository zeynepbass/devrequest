import type { ReactNode } from 'react'

interface AppShellProps {
  header: ReactNode
  sidebar?: ReactNode
  children: ReactNode
}

export function AppShell({ header, sidebar, children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      {header}
      <div className="flex min-h-0 flex-1">
        {sidebar}
        <main id="main" className="flex min-w-0 flex-1 flex-col">
          {children}
        </main>
      </div>
    </div>
  )
}
