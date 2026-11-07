import type { ReactNode } from 'react'

interface AppShellProps {
  header: ReactNode
  sidebar?: ReactNode
  children: ReactNode
}

export function AppShell({ header, sidebar, children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col lg:h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to request editor
      </a>
      {header}
      <div className="flex min-h-0 flex-1">
        {sidebar}
        <main id="main" tabIndex={-1} className="flex min-w-0 flex-1 flex-col outline-none">
          {children}
        </main>
      </div>
    </div>
  )
}
